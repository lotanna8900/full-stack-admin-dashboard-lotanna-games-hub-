// components/StoryEngine.tsx
import { useState, useEffect, useRef } from 'react';
import { Story } from 'inkjs';

interface StoryEngineProps {
  storyContent: any; 
  onMintTrigger?: (item: string) => void;
}

// We now support text AND images
interface StoryBlock {
  type: 'text' | 'image';
  content: string;
}

export default function StoryEngine({ storyContent, onMintTrigger }: StoryEngineProps) {
  const [inkStory, setInkStory] = useState<Story | null>(null);
  
  const [currentBlocks, setCurrentBlocks] = useState<StoryBlock[]>([]);
  
  const [choices, setChoices] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const storyColumnRef = useRef<HTMLDivElement>(null);
  
  // Specific Stats for Keeper's Vigil
  const [stats, setStats] = useState({
    combat: 10,
    resilience: 10,
    dexterity: 10,
    necromancy: 10,
    arcane_knowledge: 10,
    perception: 10,
    wits: 10,
    weapon: "Unarmed"
  });

  useEffect(() => {
    if (storyContent) {
      const s = new Story(storyContent);
      setInkStory(s);
      continueStory(s);
    }
  }, [storyContent]);

  // useEffect(() => {
  //  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [currentBlocks]);

  const continueStory = (story: Story) => {
    const blockBuffer: StoryBlock[] = [];
    
    while (story.canContinue) {
      const text = story.Continue();
      
      // PROCESS TAGS (Images & Blockchain)
      const tags = story.currentTags; 
      if (tags && tags.length > 0) {
        tags.forEach(tag => {
           // Handle Images
            if (tag.startsWith('image:')) {
              const imgSrc = tag.substring(6).trim(); 
              blockBuffer.push({ type: 'image', content: imgSrc });
            }
           // Handle Minting
           else if (tag.startsWith('mint:')) {
             const itemName = tag.split(':')[1].trim();
             if (onMintTrigger) onMintTrigger(itemName);
           }
        });
      }

      if (text && text.trim().length > 0) {
        blockBuffer.push({ type: 'text', content: text });
      }
    }

    // UPDATE STATS
    setStats({
        combat: story.variablesState["combat"] as number,
        resilience: story.variablesState["resilience"] as number,
        dexterity: story.variablesState["dexterity"] as number,
        necromancy: story.variablesState["necromancy"] as number,
        arcane_knowledge: story.variablesState["arcane_knowledge"] as number,
        perception: story.variablesState["perception"] as number,
        wits: story.variablesState["wits"] as number,
        weapon: story.variablesState["weapon"] as string || "Unarmed"
    });

    setCurrentBlocks(blockBuffer);
    setChoices(story.currentChoices);
  };

  const handleChoice = (index: number) => {
    if (!inkStory) return;
    inkStory.ChooseChoiceIndex(index);
    continueStory(inkStory);

    // Scroll to top of story column on choice selection
    storyColumnRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!inkStory) return <div style={{padding: '2rem', color: 'var(--white)'}}>Summoning the Keeper...</div>;

  return (
    <div className="story-engine-container">
      
      {/* LEFT COLUMN: THE STORY */}
      <div className="story-column" ref={storyColumnRef}>
        <div className="story-text">
          {currentBlocks.map((block, idx) => (
            block.type === 'image' ? (
                // RENDER IMAGE
                <div key={idx} style={{margin: '1.5rem 0', textAlign: 'center'}}>
                  <img 
                    src={
                      block.content.startsWith('http') ? block.content : 
                      block.content.includes('supabase.co') ? `https://${block.content}` :
                      `/${block.content}`
                    }
                    alt="Scene" 
                    style={{maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--grey-dark)'}}
                  />
                </div>
            ) : (
               // RENDER TEXT
               <p key={idx}>{block.content}</p>
            )
          ))}
          <div 
          // ref={bottomRef}
          />
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
      </div>

      {/* RIGHT COLUMN: STATS */}
      <div className="stats-column">
        <div className="stats-title">KEEPER STATUS</div>
        
        <div style={{ marginBottom: '1.5rem' }}>
            <div className="stat-label" style={{fontSize: '0.8rem'}}>EQUIPPED</div>
            <div className="stat-value" style={{color: 'var(--white)', fontSize: '1.1rem'}}>{stats.weapon}</div>
        </div>

        <div className="stats-grid">
          <StatRow label="Combat" value={stats.combat} />
          <StatRow label="Resilience" value={stats.resilience} />
          <StatRow label="Dexterity" value={stats.dexterity} />
          <StatRow label="Necromancy" value={stats.necromancy} isMagic />
          <StatRow label="Arcane" value={stats.arcane_knowledge} isMagic />
          <StatRow label="Perception" value={stats.perception} />
          <StatRow label="Wits" value={stats.wits} />
        </div>
      </div>
    </div>
  );
}

// Helper component
const StatRow = ({ label, value, isMagic = false }: {label: string, value: number, isMagic?: boolean}) => (
  <div className="stat-row">
    <span className="stat-label">{label}</span>
    <span className={`stat-value ${isMagic ? 'magic' : ''}`}>{value}</span>
  </div>
);