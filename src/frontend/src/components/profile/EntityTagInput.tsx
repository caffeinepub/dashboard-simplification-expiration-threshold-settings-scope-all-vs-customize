import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, ChevronDown } from 'lucide-react';

interface EntityTagInputProps {
  value: string;
  onChange: (entity: string) => void;
  suggestions: string[];
  error?: string;
}

export function EntityTagInput({ value, onChange, suggestions, error }: EntityTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (entityName: string) => {
    const trimmed = entityName.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setInputValue('');
  };

  const handleRemove = () => {
    onChange('');
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value) {
      handleRemove();
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase() !== value.toLowerCase() &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className={`flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background ${error ? 'border-destructive' : ''}`}>
        {value ? (
          <Badge variant="secondary" className="gap-1">
            {value}
            <button
              type="button"
              onClick={handleRemove}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ) : (
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type entity name..."
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-6 flex-1"
          />
        )}
      </div>

      {!value && filteredSuggestions.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <span className="text-muted-foreground">Select from existing entities</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No entities found.</CommandEmpty>
                <CommandGroup>
                  {filteredSuggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        handleAdd(suggestion);
                        setOpen(false);
                      }}
                    >
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
