import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 300;

export function ScrollShortcuts() {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Show scroll to bottom when near top
      setShowScrollToBottom(scrollTop < SCROLL_THRESHOLD && scrollBottom > SCROLL_THRESHOLD);

      // Show scroll to top when near bottom
      setShowScrollToTop(scrollBottom < SCROLL_THRESHOLD && scrollTop > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {showScrollToBottom && (
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'fixed bottom-6 right-6 z-40 shadow-lg',
            'animate-in fade-in slide-in-from-bottom-2'
          )}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      )}
      {showScrollToTop && (
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'fixed bottom-6 right-6 z-40 shadow-lg',
            'animate-in fade-in slide-in-from-bottom-2'
          )}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
