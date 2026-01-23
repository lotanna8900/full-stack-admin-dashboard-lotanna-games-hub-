import { useState, useEffect, useRef } from 'react';
import { Story } from 'inkjs';

interface MidnightEngineProps {
  storyContent: any; 
}

interface StoryBlock {
  type: 'text' | 'image';
  content: string;
}

export default function MidnightEngine({ storyContent }: MidnightEngineProps) {
  const [inkStory, setInkStory] = useState<Story | null>(null);
  const [currentBlocks, setCurrentBlocks] = useState<StoryBlock[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  
  const storyColumnRef = useRef<HTMLDivElement>(null);
  const shouldScrollToTop = useRef(false);

  useEffect(() => {
    if (storyContent) {
      const s = new Story(storyContent);
      setInkStory(s);
      continueStory(s);
    }
  }, [storyContent]);

  // Scroll to top AFTER content has been rendered and images loaded
  useEffect(() => {
    if (shouldScrollToTop.current && storyColumnRef.current) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        if (storyColumnRef.current) {
          storyColumnRef.current.scrollTop = 0;
        }
        shouldScrollToTop.current = false;
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentBlocks]);

  const continueStory = (story: Story) => {
    const blockBuffer: StoryBlock[] = []; 
    
    while (story.canContinue) {
      const text = story.Continue();
      const tags = story.currentTags; 
      
      if (tags && tags.length > 0) {
        tags.forEach(tag => {
            if (tag.toLowerCase().startsWith('image:')) {
              const imgSrc = tag.substring(6).trim(); 
              blockBuffer.push({ type: 'image', content: imgSrc });
            }
        });
      }

      if (text && text.trim().length > 0) {
        blockBuffer.push({ type: 'text', content: text });
      }
    }

    setCurrentBlocks(blockBuffer);
    setChoices(story.currentChoices);
  };

  const handleChoice = (index: number) => {
    if (!inkStory) return;
    inkStory.ChooseChoiceIndex(index);
    continueStory(inkStory);
    
    // Flag that we should scroll to top after content updates
    shouldScrollToTop.current = true;
  };

  if (!inkStory) return <div style={{padding: '2rem', color: 'var(--white)'}}>Loading Case File...</div>;

  return (
    <div className="story-engine-container">
      
      <div className="story-column" ref={storyColumnRef}>
        
        {/* Spacer to clear the header */}
        <div style={{ width: '100%', height: '750px', flexShrink: 0 }}></div>

        <div className="story-text">
          {currentBlocks.map((block, idx) => (
            block.type === 'image' ? (
                <div key={idx} style={{margin: '1.5rem 0', textAlign: 'center'}}>
                  <img 
                    src={
                        block.content.startsWith('http') ? block.content : 
                        block.content.includes('supabase.co') ? `https://${block.content}` :
                        `/${block.content}`
                    }
                    alt="Evidence" 
                    key={block.content}
                    style={{
                        width: 'auto',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',    
                        margin: '0 auto',    
                        borderRadius: '8px', 
                        border: '1px solid var(--grey-dark)',
                        filter: 'grayscale(100%)'
                    }}
                  />
                </div>
            ) : (
               <p key={idx}>{block.content}</p>
            )
          ))}
        </div>

        <div className="choices-list">
          {choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              className="choice-btn"
            >
              {choice.text}
            </button>
          ))}
        </div>
        
        <div style={{ height: '3rem' }}></div>

      </div>
    </div>
  );
}