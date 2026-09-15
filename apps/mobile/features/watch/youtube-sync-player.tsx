import { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { needsResync } from "@withu/shared-utils";
import type { WatchSession } from "@withu/shared-types";

interface Props {
  session: WatchSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
  onSeek: (position: number) => void;
}

function buildHtml(videoId: string) {
  return `
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>html,body,#player{margin:0;padding:0;width:100%;height:100%;background:#000;}</style></head>
<body>
<div id="player"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
  var player, wasPlaying = false, expected = 0;
  function post(msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      videoId: '${videoId}',
      playerVars: { rel: 0, playsinline: 1 },
      events: {
        onStateChange: function(e) {
          var t = player.getCurrentTime();
          if (e.data === YT.PlayerState.PLAYING) { wasPlaying = true; expected = t; post({ type: 'play', position: t }); }
          else if (e.data === YT.PlayerState.PAUSED) { wasPlaying = false; post({ type: 'pause', position: t }); }
        }
      }
    });
  }
  setInterval(function() {
    if (!player || !wasPlaying) return;
    var t = player.getCurrentTime();
    expected += 2;
    if (Math.abs(t - expected) > 2) { expected = t; post({ type: 'seek', position: t }); }
  }, 2000);
  window.applySync = function(position, playing) {
    if (!player || !player.seekTo) return;
    var current = player.getCurrentTime();
    if (Math.abs(current - position) > 1.5) player.seekTo(position, true);
    if (playing) player.playVideo(); else player.pauseVideo();
  };
</script>
</body></html>`;
}

export function YouTubeSyncPlayer({ session, onPlay, onPause, onSeek }: Props) {
  const webviewRef = useRef<WebView>(null);
  const html = useRef(buildHtml(session.media.mediaId)).current;

  useEffect(() => {
    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritative = session.currentPositionSeconds + Math.max(0, elapsed);
    webviewRef.current?.injectJavaScript(`window.applySync && window.applySync(${authoritative}, ${session.playing}); true;`);
  }, [session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return (
    <View className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <WebView
        ref={webviewRef}
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data) as { type: "play" | "pause" | "seek"; position: number };
            if (msg.type === "play") onPlay(msg.position);
            if (msg.type === "pause") onPause(msg.position);
            if (msg.type === "seek") onSeek(msg.position);
          } catch {
            // ignore malformed messages
          }
        }}
      />
    </View>
  );
}
