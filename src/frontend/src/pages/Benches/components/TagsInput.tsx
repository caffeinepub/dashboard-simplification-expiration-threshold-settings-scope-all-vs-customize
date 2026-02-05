import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, ChevronDown } from 'lucide-react';
import type { Tag } from '../../../backend';

interface TagsInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  suggestions: Tag[];
}

export function TagsInput({ value, onChange, suggestions }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    
    // Check if tag already exists
    if (value.some((t) => t.tagName.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }

    onChange([...value, { tagName: trimmed }]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.some((t) => t.tagName.toLowerCase() === suggestion.tagName.toLowerCase()) &&
      suggestion.tagName.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {tag.tagName}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="flex-1 flex items-center gap-2 min-w-[120px]">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? 'Add tags...' : ''}
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-6"
          />
          {inputValue && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => addTag(inputValue)}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {filteredSuggestions.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <span className="text-muted-foreground">Select from existing tags</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {filteredSuggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        addTag(suggestion.tagName);
                        setOpen(false);
                      }}
                    >
                      {suggestion.tagName}
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
