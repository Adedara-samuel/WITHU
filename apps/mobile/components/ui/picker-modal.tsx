import { useState } from "react";
import { FlatList, Pressable, Text } from "react-native";
import { Check } from "lucide-react-native";
import { Dialog } from "./dialog";
import { Button } from "./button";

interface Option<T extends string> {
  value: T;
  label: string;
}

export function PickerButton<T extends string>({
  title,
  options,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  options: Option<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Button variant="secondary" size="sm" onPress={() => setOpen(true)}>
        {selected?.label ?? placeholder}
      </Button>
      <Dialog visible={open} onClose={() => setOpen(false)} title={title}>
        <FlatList
          data={options}
          keyExtractor={(o) => o.value}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className="flex-row items-center justify-between border-b border-border py-3.5"
            >
              <Text className="text-base text-foreground">{item.label}</Text>
              {item.value === value && <Check size={18} color="#7A2C4C" />}
            </Pressable>
          )}
        />
      </Dialog>
    </>
  );
}
