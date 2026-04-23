import { useState, useEffect, useRef, useCallback } from "react";

const FELT = "#1a4a2e";
const FELT_DARK = "#0f2e1c";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#f0d080";
const CHIP_RED = "#c0392b";
const CHIP_GREEN = "#1e8449";
const CHIP_BLACK = "#1a1a1a";
const WHITE = "#f5f0e8";
const TEXT_MUTED = "#a89070";

const DOT_POSITIONS = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,20],[75,20],[25,50],[75,50],[25,80],[75,80]],
};

// Odds payouts by point
const ODDS_PAYOUT = { 4:2, 5:1.5, 6:1.2, 8:1.2, 9:1.5, 10:2 };
const ODDS_LABEL  = { 4:"2:1", 5:"3:2", 6:"6:5", 8:"6:5", 9:"3:2", 10:"2:1" };
// For lay odds (don't pass / don't come), risk more to win less
const LAY_PAYOUT  = { 4:0.5, 5:0.667, 6:0.833, 8:0.833, 9:0.667, 10:0.5 };

// ─── Table Diagram ────────────────────────────────────────────────────────────

function TableDiagram() {
  const [hovered, setHovered] = useState(null);
  const zones = [
    { id:"props",   label:"PROPOSITIONS (stickman)", x:10,y:2, w:80,h:12, color:"#2a1a0a", hc:"#ff8a65", info:"Center prop bets — Any 7, Any Craps, Horn, Hardways. Toss chips to the stickman and call your bet aloud." },
    { id:"place4",  label:"4",  x:10,y:16,w:12,h:12, color:"#1a1a2a", hc:"#ffb74d", info:"Place 4 box. Slide to dealer: 'place the four.'" },
    { id:"place5",  label:"5",  x:24,y:16,w:12,h:12, color:"#1a1a2a", hc:"#ffb74d", info:"Place 5 box. Slide to dealer: 'place the five.'" },
    { id:"place6",  label:"6",  x:38,y:16,w:12,h:12, color:"#1a2a1a", hc:"#00c875", info:"Place 6. Best place bet (1.52% edge). Bet in multiples of $6 — pays $7 each." },
    { id:"place8",  label:"8",  x:52,y:16,w:12,h:12, color:"#1a2a1a", hc:"#00c875", info:"Place 8. Best place bet (1.52% edge). Bet in multiples of $6 — pays $7 each." },
    { id:"place9",  label:"9",  x:66,y:16,w:12,h:12, color:"#1a1a2a", hc:"#ffb74d", info:"Place 9 box. Slide to dealer: 'place the nine.'" },
    { id:"place10", label:"10", x:80,y:16,w:10,h:12, color:"#1a1a2a", hc:"#ffb74d", info:"Place 10 box. Slide to dealer: 'place the ten.'" },
    { id:"field",   label:"FIELD  2 3 4 9 10 11 12", x:10,y:30,w:80,h:10, color:"#3a1a1a", hc:"#ef9a9a", info:"Field bet — you place your own chip. One-roll. Wins on 2,3,4,9,10,11,12. Loses on 5,6,7,8." },
    { id:"come",    label:"COME", x:10,y:42,w:80,h:19, color:"#0a3a2a", hc:"#4db6ac", info:"Come bet area. Works like Pass Line but placed mid-round. Your next roll is your personal come-out. Once it travels to a number box, you can take odds behind it." },
    { id:"dontpass",label:"DON'T PASS BAR 12", x:10,y:63,w:80,h:10, color:"#3a1a6a", hc:"#9575cd", info:"Don't Pass strip — thin bar just inside the Pass Line. 'BAR 12' means 12 is a push." },
    { id:"pass",    label:"PASS  LINE", x:10,y:75,w:80,h:12, color:"#1a4a8a", hc:"#4fc3f7", info:"Pass Line — outermost strip, full length of the table. Most popular bet." },
    { id:"odds",    label:"★ ODDS — behind Pass Line (not printed on felt)", x:10,y:89,w:80,h:8, color:"#0a2a0a", hc:"#00c875", info:"TRUE ODDS: Not on the felt! After point is set, place chips directly behind your Pass Line bet. Tell dealer 'odds on the pass.' Same spot behind Come bets once they travel to a number." },
  ];
  return (
    <div style={{ margin:"12px 0" }}>
      <svg viewBox="0 0 100 100" style={{ width:"100%", maxWidth:540, display:"block", margin:"0 auto", borderRadius:8, border:`1px solid ${GOLD}44` }}>
        <rect width="100" height="100" fill="#0a1a0a"/>
        {zones.map(z=>(
          <g key={z.id} onMouseEnter={()=>setHovered(z.id)} onMouseLeave={()=>setHovered(null)} style={{cursor:"pointer"}}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={hovered===z.id?z.hc+"44":z.color} stroke={hovered===z.id?z.hc:"#ffffff22"} strokeWidth="0.3" rx="0.5"/>
            <text x={z.x+z.w/2} y={z.y+z.h/2+1.2} textAnchor="middle" fontSize="2" fill={hovered===z.id?z.hc:"#ffffffaa"} fontFamily="monospace" fontWeight={hovered===z.id?"bold":"normal"}>{z.label}</text>
          </g>
        ))}
      </svg>
      <div style={{ minHeight:48, marginTop:8, padding:"8px 12px", background:hovered?"#1a1a1a":"transparent", border:hovered?`1px solid ${GOLD}44`:"1px solid transparent", borderRadius:6, fontSize:12, color:"#ddd", transition:"all 0.2s" }}>
        {hovered
          ? <><strong style={{color:GOLD_LIGHT}}>{zones.find(z=>z.id===hovered)?.label}: </strong>{zones.find(z=>z.id===hovered)?.info}</>
          : <span style={{color:"#444"}}>Hover any zone to see where it is on a real table</span>}
      </div>
    </div>
  );
}

// ─── Guide Modal ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS = [
  {
    id:"overview", title:"How Craps Works", icon:"🎲",
    content:[
      { type:"text", body:"Craps is played in rounds. Each round has two phases: the Come-Out Roll and the Point Phase. One player is the 'shooter' — at a real casino, dice rotate clockwise, but everyone bets on the same outcome." },
      { type:"phases", items:[
        { phase:"COME-OUT ROLL", color:"#4fc3f7", desc:"Roll 7 or 11 → Pass Line wins immediately. Roll 2, 3, or 12 → 'Craps,' Pass Line loses. Any other number (4,5,6,8,9,10) becomes the Point." },
        { phase:"POINT PHASE", color:"#ffb74d", desc:"A Point marker (ON puck) sits on that number. Roll until you hit the Point again (Pass wins!) or roll a 7 (7-Out: Pass loses, round ends)." },
      ]},
      { type:"text", body:"With the right bets you can keep the house edge below 0.5%. Most of the table is a trap. This guide shows you which bets are which." },
    ],
  },
  {
    id:"table", title:"The Physical Table", icon:"🪵",
    content:[
      { type:"text", body:"A craps table is a long felt surface mirrored on each end. Two dealers manage each side; a boxman watches chips in the center; the stickman controls the dice and prop bets. Hover each zone:" },
      { type:"table_diagram" },
      { type:"zones", items:[
        { label:"Pass Line", color:"#4fc3f7", position:"Outermost rail, full length. Widest printed strip — impossible to miss." },
        { label:"Don't Pass Bar", color:"#9575cd", position:"Thin strip inside Pass Line. 'BAR 12' = 12 is a push, not a win." },
        { label:"Come / Don't Come", color:"#4db6ac", position:"Large center section. Come bets start here; dealer moves chips to number boxes once your personal point is set. Come odds go behind that number box." },
        { label:"Place Bets 4–10", color:"#ffb74d", position:"Row of numbered boxes across the top. Slide chips to dealer; they place them. Never reach across the layout." },
        { label:"Field", color:"#ef9a9a", position:"Wide strip listing 2,3,4,9,10,11,12 — place your own chip here before each roll." },
        { label:"True Odds", color:"#00c875", position:"NOT on the felt. After point is set, stack odds chips behind your Pass Line bet outside the rail. For Come bets, behind the number box the dealer placed your chips in." },
        { label:"Hardways / Props", color:"#ff8a65", position:"Center, managed by stickman. Toss chips to stickman and call: 'hard eight,' 'any craps,' etc." },
      ]},
    ],
  },
  {
    id:"odds", title:"True Odds — The 0% Bet", icon:"★",
    content:[
      { type:"text", body:"The True Odds bet is the single best bet in any casino. The casino pays you exactly what the math says the bet is worth — no markup, no house cut. Every other bet in the building has a margin built in. This one doesn't. It's not 'free' in the sense of costing nothing — you're still risking money — it's even odds, meaning the payout perfectly matches the probability." },
      { type:"callout", color:"#00c875", title:"Why it matters", body:"Every other bet has a built-in edge. Slots: 5–15%. Roulette: 2.7–5.3%. Pass Line: 1.41%. True Odds: exactly 0%. The casino earns nothing on this bet. They allow it because most players don't know it exists — and because the flat Pass/Don't Pass bet they require underneath still earns them their edge." },
      { type:"text", body:"How to take odds: once the point is set, place chips directly behind your Pass Line bet — outside the outermost rail. For Come bets that have traveled to a number, place odds behind the number box. Payout depends on the point:" },
      { type:"odds_table", rows:[
        { point:"4 or 10", ways_to_hit:3, ways_to_seven:6, true_odds:"2 : 1", example:"$10 wins $20", difficulty:"hard" },
        { point:"5 or 9",  ways_to_hit:4, ways_to_seven:6, true_odds:"3 : 2", example:"$10 wins $15", difficulty:"medium" },
        { point:"6 or 8",  ways_to_hit:5, ways_to_seven:6, true_odds:"6 : 5", example:"$10 wins $12", difficulty:"easy" },
      ]},
      { type:"callout", color:"#ffb74d", title:"Odds cap — real casino limits", body:"Casinos limit odds to a multiple of your flat bet. Strip casinos typically allow 3x–5x odds. Downtown Las Vegas: 10x or 100x. The app lets you choose 3x, 5x, or 10x to simulate different casino conditions. Always take the maximum allowed — the more of your wager at true odds, the lower your combined edge." },
      { type:"callout", color:"#4fc3f7", title:"Combined house edge with odds (Pass Line)", body:"Pass alone: 1.41%. With 1x: 0.85%. With 2x: 0.61%. With 3x: 0.47%. With 5x: 0.33%. With 10x: 0.18%. The flat bet always carries 1.41% edge; the odds dilute it across your total wager." },
      { type:"text", body:"Come bet odds work identically: once your Come bet travels to a number, tell the dealer 'odds on the come' and place chips behind that number's box. If a 7-out happens, your Come odds are returned (in real casinos, Come odds are 'off' on the come-out roll by default — they don't lose to a 7 on come-out, only the flat Come bet does)." },
      { type:"callout", color:"#00c875", title:"Casino chip tip", body:"For 6/8, bet odds in multiples of $5 (pays $6 per $5). For 5/9, bet even amounts (pays 3:2). For 4/10, any amount. This avoids the dealer breaking chips." },
    ],
  },
  {
    id:"strategy", title:"Smart Bettor Strategy", icon:"✓",
    content:[
      { type:"text", body:"Craps has the best and worst bets in the casino sitting right next to each other. This strategy keeps your combined house edge well under 1%:" },
      { type:"strategy_steps", items:[
        { step:1, title:"Pass Line + Maximum Odds", edge:"~0.4%", color:"#00c875", desc:"Make a modest Pass Line bet every come-out. Once the point is set, back it with maximum true odds. This is the foundation." },
        { step:2, title:"Come bets + Odds", edge:"~0.4%", color:"#00c875", desc:"Once a point is set, add Come bets to get more numbers working. Take maximum odds on each Come bet once it travels. This is the full 'Pass Line + Come' strategy used by serious players." },
        { step:3, title:"Place 6 and/or Place 8", edge:"1.52%", color:"#4fc3f7", desc:"If you want instant action on 6 or 8 without waiting for a Come bet to travel, Place 6/8 in multiples of $6. Best place bet on the table." },
        { step:4, title:"Avoid everything else", edge:"5–17%", color:"#ef5350", desc:"Any 7, Horn, Hardways, Field, and proposition bets carry brutal edges. The casino makes most of its craps profit from these bets." },
        { step:5, title:"Don't Pass — the better odds", edge:"1.36%", color:"#b39ddb", desc:"Don't Pass + lay odds has a lower house edge than Pass Line. You're rooting for 7 once the point is set — mathematically the most likely outcome on any roll. The only cost is social: you're cheering against the table. See the Dark Side guide for the full breakdown." },
      ]},
      { type:"callout", color:"#ffb74d", title:"Casino etiquette", body:"Buy in between rolls — lay bills flat on the layout. Say 'change.' Don't touch bets after dice are out. Hand place chips to the dealer, don't reach across. Toss prop chips to the stickman. If dice leave the table, inspect them before accepting them back." },
    ],
  },
  {
    id:"darkside", title:"The Dark Side", icon:"🌑",
    content:[
      { type:"text", body:"'The dark side' is craps slang for betting Don't Pass and Don't Come — rooting for the 7 to end the round rather than for the point to repeat. It's mathematically the smarter bet, carries a lower house edge, and is perfectly legal. It also makes you the least popular person at the table." },
      { type:"callout", color:"#b39ddb", title:"The actual math", body:"Don't Pass: 1.36% house edge. Pass Line: 1.41%. Over thousands of rolls that difference compounds. The dark side wins slightly more often in expectation — not because anything mysterious is happening, but because the come-out phase slightly favors the Pass Line (7/11 wins 8 ways, craps loses only 3), while the point phase heavily favors Don't Pass (7 is always the most likely roll at 6/36, more likely than any point number). The point phase advantage outweighs the come-out disadvantage." },
      { type:"text", body:"Here's what the come-out actually looks like from each side:" },
      { type:"phases", items:[
        { phase:"COME-OUT: PASS LINE", color:"#4fc3f7", desc:"Win on 7 or 11 (8 ways out of 36). Lose on 2, 3, or 12 (4 ways). Win more than you lose. Come-out favors Pass Line." },
        { phase:"COME-OUT: DON'T PASS", color:"#9575cd", desc:"Win on 2 or 3 (3 ways). Push on 12 (1 way — the BAR). Lose on 7 or 11 (8 ways). Come-out slightly hurts Don't Pass." },
      ]},
      { type:"text", body:"But once the point is set, the equation flips entirely. 7 can be rolled 6 different ways — more than any other number. The point numbers have between 3 and 5 ways. So the Don't Pass bettor is now a mathematical favorite on every single subsequent roll, and that advantage compounds with every roll until the round ends." },
      { type:"callout", color:"#00c875", title:"Why it's still the same game", body:"You're not playing a different game — you're just on the other side of the same bet. The shooter rolls, the dice land, money moves. The only difference is which direction. Thinking of it as 'rooting for 7' is the same as a Pass Line player rooting for their point number. Both are just rooting for the math to work out." },
      { type:"text", body:"The cultural stigma exists because craps evolved as a social game around a hot shooter. Pass Line players cheer together, tip the shooter, blow on the dice. Don't Pass players sit quietly, collect when everyone else loses, and occasionally get glared at. Some tables have a genuine unwritten rule against celebrating a 7-out. None of that has anything to do with the odds." },
      { type:"callout", color:"#ffb74d", title:"Practical dark side tips", body:"Keep it low-key. Don't announce you're on the don'ts. Don't cheer when the shooter sevens out. Collect your chips quietly. If someone asks, you can explain — most experienced players respect the math. Avoid it at crowded, high-energy tables where everyone is deep into Pass Line bets; stick to quieter tables or graveyard-shift games where the vibe is calmer." },
      { type:"text", body:"The full dark side strategy mirrors the Pass Line strategy exactly: Don't Pass flat bet, maximum Don't Pass Odds once the point is set, Don't Come bets to get additional numbers working (rooting for 7 before each of those numbers repeats), and Don't Come Odds behind each traveled bet. Same structure, same low combined edge, opposite direction." },
      { type:"callout", color:"#9575cd", title:"One real downside", body:"Lay odds (Don't Pass Odds) require you to risk more than you win. On a point of 4 or 10, you lay $20 to win $10. On 6 or 8, you lay $6 to win $5. Your chips on the table look bigger than they'd look for a Pass Line player at the same expected profit. If you're playing with a limited bankroll, that larger at-risk amount matters even if the edge is in your favor." },
    ],
  },
  {
    id:"glossary", title:"Table Talk", icon:"💬",
    content:[
      { type:"text", body:"Know these terms and you'll look like you belong at the table:" },
      { type:"glossary", items:[
        { term:"Dark side",      def:"Slang for betting Don't Pass / Don't Come. Mathematically sound, socially frowned upon. You're rooting for the 7." },
        { term:"Wrong bettor",   def:"Another term for a dark side / Don't Pass player. 'Wrong' refers to table convention, not the math." },
        { term:"Right bettor",   def:"A Pass Line player — betting with the shooter. 'Right' is the social convention, not necessarily the better odds." },
        { term:"Shooter",       def:"The player throwing the dice." },
        { term:"Come-out",      def:"First roll of a new round to establish the point." },
        { term:"Natural",       def:"7 or 11 on come-out — Pass Line wins immediately." },
        { term:"Craps",         def:"2, 3, or 12 on come-out — Pass Line loses." },
        { term:"Point",         def:"Number (4/5/6/8/9/10) set on come-out that must repeat to win." },
        { term:"7-Out",         def:"Rolling 7 after point is set — Pass Line loses, round ends." },
        { term:"ON puck",       def:"White disc placed on the point number." },
        { term:"OFF puck",      def:"Black side of puck in corner — no point set." },
        { term:"Stickman",      def:"Controls dice, manages center prop bets." },
        { term:"Boxman",        def:"Supervisor seated at center watching chips." },
        { term:"Lay odds",      def:"Taking true odds on a Don't Pass/Don't Come bet." },
        { term:"Come odds off", def:"By default, Come bet odds don't lose to a come-out 7 — only the flat bet does. You can ask for 'odds working' to override." },
        { term:"Working",       def:"Bets active for the current roll." },
        { term:"Press it",      def:"Double a place bet after a win." },
        { term:"Same dice",     def:"Request your dice back after they leave the table." },
        { term:"Yo",            def:"Slang for 11 (avoids confusion with 7)." },
        { term:"Midnight",      def:"Slang for 12." },
        { term:"Snake eyes",    def:"Two 1s — rolling 2." },
        { term:"Boxcars",       def:"Two 6s — rolling 12." },
        { term:"Hard way",      def:"Rolling a pair to hit an even number (e.g. 3+3 for hard 6)." },
        { term:"Easy way",      def:"Even number without a pair (e.g. 4+2 for easy 6)." },
      ]},
    ],
  },
];

function GuideModal({ onClose }) {
  const [activeSection, setActiveSection] = useState("overview");
  const section = GUIDE_SECTIONS.find(s=>s.id===activeSection);

  const renderItem = (item, i) => {
    if (item.type==="text") return <p key={i} style={{fontSize:13,color:"#ccc",lineHeight:1.7,margin:"0 0 12px"}}>{item.body}</p>;
    if (item.type==="table_diagram") return <TableDiagram key={i}/>;
    if (item.type==="callout") return (
      <div key={i} style={{background:item.color+"18",border:`1px solid ${item.color}55`,borderLeft:`3px solid ${item.color}`,borderRadius:6,padding:"10px 14px",margin:"12px 0"}}>
        <div style={{fontSize:12,fontWeight:600,color:item.color,marginBottom:4}}>{item.title}</div>
        <div style={{fontSize:12,color:"#bbb",lineHeight:1.6}}>{item.body}</div>
      </div>
    );
    if (item.type==="phases") return (
      <div key={i} style={{display:"flex",gap:10,margin:"12px 0",flexWrap:"wrap"}}>
        {item.items.map((p,j)=>(
          <div key={j} style={{flex:"1 1 200px",background:p.color+"18",border:`1px solid ${p.color}44`,borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:11,fontWeight:700,color:p.color,letterSpacing:1,marginBottom:6}}>{p.phase}</div>
            <div style={{fontSize:12,color:"#bbb",lineHeight:1.6}}>{p.desc}</div>
          </div>
        ))}
      </div>
    );
    if (item.type==="zones") return (
      <div key={i} style={{margin:"12px 0"}}>
        {item.items.map((z,j)=>(
          <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid #1e1e1e"}}>
            <div style={{width:10,height:10,flexShrink:0,borderRadius:2,background:z.color,marginTop:3}}/>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:z.color,marginBottom:2}}>{z.label}</div>
              <div style={{fontSize:11,color:"#aaa",lineHeight:1.5}}>{z.position}</div>
            </div>
          </div>
        ))}
      </div>
    );
    if (item.type==="odds_table") return (
      <div key={i} style={{margin:"12px 0",overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{background:"#1a1a1a"}}>
              {["Point","Ways to make it","Ways to 7","Casino pays","Example"].map(h=>(
                <th key={h} style={{padding:"6px 10px",color:TEXT_MUTED,fontWeight:600,textAlign:"left",borderBottom:"1px solid #333",fontSize:11}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.rows.map((r,j)=>{
              const c=r.difficulty==="easy"?"#00c875":r.difficulty==="medium"?"#ffb74d":"#ef5350";
              return (
                <tr key={j} style={{background:j%2===0?"#111":"#141414"}}>
                  <td style={{padding:"8px 10px",color:GOLD_LIGHT,fontWeight:600}}>{r.point}</td>
                  <td style={{padding:"8px 10px",color:c}}>{r.ways_to_hit} of 36</td>
                  <td style={{padding:"8px 10px",color:"#ef5350"}}>{r.ways_to_seven} of 36</td>
                  <td style={{padding:"8px 10px",color:"#00c875",fontWeight:700}}>{r.true_odds}</td>
                  <td style={{padding:"8px 10px",color:"#aaa"}}>{r.example}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    if (item.type==="strategy_steps") return (
      <div key={i} style={{margin:"12px 0",display:"flex",flexDirection:"column",gap:10}}>
        {item.items.map((s,j)=>(
          <div key={j} style={{display:"flex",gap:12,alignItems:"flex-start",background:"#111",border:`1px solid ${s.color}33`,borderRadius:8,padding:"12px 14px"}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:s.color+"22",border:`2px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:s.color}}>{s.step}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:600,color:"#eee"}}>{s.title}</span>
                <span style={{fontSize:10,background:s.color+"22",color:s.color,padding:"1px 6px",borderRadius:3}}>{s.edge} edge</span>
              </div>
              <div style={{fontSize:12,color:"#aaa",lineHeight:1.6}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );
    if (item.type==="glossary") return (
      <div key={i} style={{margin:"12px 0"}}>
        {item.items.map((g,j)=>(
          <div key={j} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #1a1a1a"}}>
            <div style={{width:120,flexShrink:0,fontSize:12,fontWeight:600,color:GOLD_LIGHT}}>{g.term}</div>
            <div style={{fontSize:12,color:"#aaa",lineHeight:1.5}}>{g.def}</div>
          </div>
        ))}
      </div>
    );
    return null;
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0e0e0e",border:`2px solid ${GOLD}66`,borderRadius:16,width:"100%",maxWidth:720,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${GOLD}44`,background:"#080808",flexShrink:0}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:GOLD_LIGHT}}>Casino Craps Guide</div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #444",borderRadius:6,color:"#aaa",padding:"4px 12px",cursor:"pointer",fontSize:12,fontFamily:"'Oswald',sans-serif"}}>CLOSE ✕</button>
        </div>
        <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
          <div style={{width:160,flexShrink:0,borderRight:"1px solid #222",padding:"12px 0",overflowY:"auto",background:"#080808"}}>
            {GUIDE_SECTIONS.map(s=>(
              <div key={s.id} onClick={()=>setActiveSection(s.id)} style={{padding:"10px 14px",cursor:"pointer",background:activeSection===s.id?"#1a1a1a":"transparent",borderLeft:activeSection===s.id?`3px solid ${GOLD}`:"3px solid transparent",transition:"background 0.15s"}}>
                <div style={{fontSize:16,marginBottom:3}}>{s.icon}</div>
                <div style={{fontSize:11,color:activeSection===s.id?GOLD_LIGHT:"#888",lineHeight:1.3}}>{s.title}</div>
              </div>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:GOLD_LIGHT,marginBottom:16,marginTop:0}}>{section?.icon} {section?.title}</h2>
            {section?.content.map((item,i)=>renderItem(item,i))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Odds Detail Panel ────────────────────────────────────────────────────────

function OddsDetailPanel({ point, oddsMultiplier, passLineBet, passOddsBet }) {
  const rows = [
    { pts:"4 or 10", ways:"3/36", payout:"2 : 1", note:"Hardest" },
    { pts:"5 or 9",  ways:"4/36", payout:"3 : 2", note:"Medium" },
    { pts:"6 or 8",  ways:"5/36", payout:"6 : 5", note:"Easiest" },
  ];
  const activeRow = point ? rows.find(r=>r.pts.includes(String(point))) : null;
  const maxOdds = passLineBet * oddsMultiplier;
  const remaining = Math.max(0, maxOdds - passOddsBet);

  return (
    <div style={{margin:"4px 12px 8px",background:"#0a1a0a",border:"1px solid #00c87544",borderRadius:8,overflow:"hidden",fontSize:11}}>
      <div style={{padding:"6px 10px",background:"#00c87518",borderBottom:"1px solid #00c87522",color:"#00c875",fontWeight:600,fontSize:10,letterSpacing:1}}>TRUE ODDS PAYOUT BY POINT</div>
      {rows.map((r,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",padding:"5px 10px",background:activeRow===r?"#00c87512":"transparent",borderLeft:activeRow===r?"3px solid #00c875":"3px solid transparent",borderBottom:i<rows.length-1?"1px solid #111":"none"}}>
          <div style={{flex:1,color:activeRow===r?"#fff":"#aaa"}}>{r.pts}</div>
          <div style={{width:36,color:"#666",fontSize:10}}>{r.ways}</div>
          <div style={{width:44,color:"#00c875",fontWeight:700}}>{r.payout}</div>
          <div style={{width:52,color:"#555",fontSize:10,textAlign:"right"}}>{r.note}</div>
        </div>
      ))}
      <div style={{padding:"6px 10px",borderTop:"1px solid #111"}}>
        <div style={{color:"#555",fontSize:10,lineHeight:1.5}}>
          Place chips <em style={{color:"#777"}}>behind</em> Pass Line, outside the rail.{" "}
          <em style={{color:"#777"}}>"Odds on the pass."</em>
        </div>
        {passLineBet > 0 && (
          <div style={{marginTop:4,fontSize:10,color:"#4fc3f7"}}>
            {oddsMultiplier}x odds limit · max ${maxOdds}
            {passOddsBet > 0 && <span style={{color:"#ffb74d"}}> · ${passOddsBet} placed · ${remaining} remaining</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contextual Tip ───────────────────────────────────────────────────────────

function ContextTip({ phase, point, bets, oddsMultiplier, onOpenGuide }) {
  const hasPass      = bets.passLine > 0;
  const hasOdds      = bets.passOdds > 0;
  const hasDont      = bets.dontPass > 0;
  const hasDontOdds  = bets.dontPassOdds > 0;
  const oddsPayouts  = { 4:"2:1", 5:"3:2", 6:"6:5", 8:"6:5", 9:"3:2", 10:"2:1" };
  const maxPassOdds  = (bets.passLine||0) * oddsMultiplier;
  const maxDontOdds  = (bets.dontPass||0) * oddsMultiplier;
  const passAtMax    = hasOdds  && (bets.passOdds||0)      >= maxPassOdds;
  const dontAtMax    = hasDontOdds && (bets.dontPassOdds||0) >= maxDontOdds;

  let tip = null;

  if (phase === "comeout" && !hasPass && !hasDont) {
    // Neutral entry tip — present both options with accurate edges
    tip = {
      color: "#4fc3f7", icon: "i",
      text: "Choose your side: Pass Line (1.41% edge) bets with the shooter, Don't Pass (1.36% edge) bets against. Don't Pass has slightly better odds — both are smart choices.",
      action: null,
    };
  } else if (phase === "point" && hasPass && !hasOdds) {
    tip = {
      color: "#00c875", icon: "★",
      text: `Point is ${point} — take True Odds on your Pass Line! Pays ${oddsPayouts[point]||"true odds"} with zero house edge. Place chips behind your Pass Line bet. Up to ${oddsMultiplier}x.`,
      action: "How odds work →", guide: "odds",
    };
  } else if (phase === "point" && hasDont && !hasDontOdds) {
    tip = {
      color: "#00c875", icon: "★",
      text: `Point is ${point} — take Don't Pass Odds! Lay true odds against the point with zero house edge. Up to ${oddsMultiplier}x your Don't Pass bet.`,
      action: "How odds work →", guide: "odds",
    };
  } else if (phase === "point" && hasOdds && !passAtMax) {
    tip = {
      color: "#4fc3f7", icon: "↑",
      text: `You can add more Pass Line Odds — up to $${maxPassOdds} (${oddsMultiplier}x). Every dollar shifted into odds lowers your combined house edge.`,
      action: null,
    };
  } else if (phase === "point" && hasDontOdds && !dontAtMax) {
    tip = {
      color: "#4fc3f7", icon: "↑",
      text: `You can add more Don't Pass Odds — up to $${maxDontOdds} (${oddsMultiplier}x). More odds = lower combined edge.`,
      action: null,
    };
  } else if (phase === "point" && (passAtMax || dontAtMax)) {
    tip = {
      color: "#00c875", icon: "✓",
      text: `Maximum odds placed. Combined house edge is well under 1%. This is optimal craps strategy.`,
      action: null,
    };
  }

  if (!tip) return null;
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:10,background:tip.color+"18",border:`1px solid ${tip.color}55`,borderRadius:8,padding:"10px 14px",maxWidth:400,width:"100%"}}>
      <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:tip.color+"33",border:`1px solid ${tip.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:tip.color,fontWeight:700,marginTop:1}}>{tip.icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"#ccc",lineHeight:1.6}}>{tip.text}</div>
        {tip.action&&<div onClick={()=>onOpenGuide(tip.guide)} style={{fontSize:11,color:tip.color,cursor:"pointer",marginTop:4,textDecoration:"underline"}}>{tip.action}</div>}
      </div>
    </div>
  );
}

// ─── Die ─────────────────────────────────────────────────────────────────────

function Die({ value, rolling }) {
  const [displayVal, setDisplayVal] = useState(value||1);
  const [angle, setAngle] = useState(0);
  const ref = useRef(null);
  useEffect(()=>{
    if (rolling) {
      let t=0;
      ref.current=setInterval(()=>{
        setDisplayVal(Math.floor(Math.random()*6)+1);
        setAngle(p=>p+45);
        if (++t>12){ clearInterval(ref.current); setDisplayVal(value); setAngle(0); }
      },80);
    } else { setDisplayVal(value||1); }
    return ()=>clearInterval(ref.current);
  },[rolling,value]);
  const dots=DOT_POSITIONS[displayVal]||DOT_POSITIONS[1];
  return (
    <div style={{width:80,height:80,background:"linear-gradient(145deg,#fff8ee,#e8d8c0)",borderRadius:14,border:"2px solid #c8a870",boxShadow:rolling?"0 0 20px rgba(240,200,80,0.8),4px 4px 12px rgba(0,0,0,0.6)":"4px 4px 12px rgba(0,0,0,0.6),inset 1px 1px 3px rgba(255,255,255,0.8)",position:"relative",transform:`rotate(${angle}deg)`,transition:rolling?"none":"transform 0.3s ease, box-shadow 0.3s",flexShrink:0}}>
      {dots.map(([x,y],i)=><div key={i} style={{position:"absolute",width:12,height:12,borderRadius:"50%",background:"#1a0a00",boxShadow:"inset 1px 1px 2px rgba(255,255,255,0.2)",left:`${x}%`,top:`${y}%`,transform:"translate(-50%,-50%)"}}/>)}
    </div>
  );
}

function Chip({ amount }) {
  const C={1:{bg:"#e8e8e8",b:"#aaa",t:"#333"},5:{bg:CHIP_RED,b:"#8b1a10",t:"#fff"},25:{bg:CHIP_GREEN,b:"#145030",t:"#fff"},100:{bg:CHIP_BLACK,b:"#444",t:"#f0d080"},500:{bg:"#6b2fa0",b:"#4a1f70",t:"#fff"}};
  const c=C[amount]||C[5];
  return <div style={{width:44,height:44,borderRadius:"50%",background:c.bg,border:`3px solid ${c.b}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:c.t,fontFamily:"'Oswald',sans-serif",boxShadow:"2px 2px 6px rgba(0,0,0,0.5)",cursor:"pointer",userSelect:"none",flexShrink:0,outline:`2px dashed ${c.b}`,outlineOffset:-6}}>{amount>=1000?`${amount/1000}K`:amount}</div>;
}

// ─── Bet Definitions ──────────────────────────────────────────────────────────

const a = (ok, reason=null) => ({ ok, reason });

const BETS = {
  passLine: {
    label:"Pass Line", houseEdge:1.41, trueOdds:"251:244", payout:"1:1",
    desc:"Win on 7/11 come-out; lose on 2/3/12. If point set, win if point repeats before 7.",
    category:"primary",
    available: s => {
      if (s.phase!=="comeout") return a(false,"Come-out roll only");
      if (s.bets.passLine)     return a(false,"Already on Pass Line");
      if (s.bets.dontPass)     return a(false,"Can't combine with Don't Pass");
      return a(true);
    },
  },
  dontPass: {
    label:"Don't Pass", houseEdge:1.36, trueOdds:"976:949", payout:"1:1",
    desc:"Win on 2/3; push on 12; lose on 7/11. After point: win if 7 comes first.",
    category:"primary",
    available: s => {
      if (s.phase!=="comeout") return a(false,"Come-out roll only");
      if (s.bets.dontPass)     return a(false,"Already on Don't Pass");
      if (s.bets.passLine)     return a(false,"Can't combine with Pass Line");
      return a(true);
    },
  },
  come: {
    label:"Come", houseEdge:1.41, trueOdds:"251:244", payout:"1:1",
    desc:"Like Pass Line but placed after the point is set. Your next roll is your personal come-out. Once it travels to a number, take odds behind it for zero house edge.",
    category:"primary",
    available: s => {
      if (s.phase!=="point")  return a(false,"Only available after point is set");
      if (s.pendingCome>0)    return a(false,"Come bet already pending this roll");
      if (s.pendingDontCome>0)return a(false,"Can't combine with Don't Come");
      return a(true);
    },
  },
  dontCome: {
    label:"Don't Come", houseEdge:1.36, trueOdds:"976:949", payout:"1:1",
    desc:"Like Don't Pass but placed after the point is set.",
    category:"primary",
    available: s => {
      if (s.phase!=="point")  return a(false,"Only available after point is set");
      if (s.pendingDontCome>0)return a(false,"Don't Come already pending this roll");
      if (s.pendingCome>0)    return a(false,"Can't combine with Come");
      return a(true);
    },
  },
  passOdds: {
    label:"Pass Line Odds", houseEdge:0.0, trueOdds:"by point", payout:"true odds",
    desc:"Zero house edge. Place chips behind your Pass Line after the point is set. The point was set by the come-out — you back it with true-odds money. Pays 2:1 on 4/10, 3:2 on 5/9, 6:5 on 6/8.",
    category:"odds",
    available: s => {
      if (s.phase!=="point")  return a(false,"Only available after point is set");
      if (!s.bets.passLine)   return a(false,"Requires a Pass Line bet first");
      const max = s.bets.passLine * s.oddsMultiplier;
      if ((s.bets.passOdds||0) >= max) return a(false,`At ${s.oddsMultiplier}x max — $${max} already placed`);
      return a(true);
    },
    best:true,
  },
  dontPassOdds: {
    label:"Don't Pass Odds", houseEdge:0.0, trueOdds:"by point", payout:"true odds (lay)",
    desc:"Zero house edge. Lay odds against the point: 1:2 on 4/10, 2:3 on 5/9, 5:6 on 6/8. You risk more than you win, but no house edge.",
    category:"odds",
    available: s => {
      if (s.phase!=="point")  return a(false,"Only available after point is set");
      if (!s.bets.dontPass)   return a(false,"Requires a Don't Pass bet first");
      const max = s.bets.dontPass * s.oddsMultiplier;
      if ((s.bets.dontPassOdds||0) >= max) return a(false,`At ${s.oddsMultiplier}x max`);
      return a(true);
    },
    best:true,
  },
  place4:  { label:"Place 4",  houseEdge:6.67, payout:"9:5",  trueOdds:"2:1", desc:"Bet 4 hits before 7. Slide to dealer: 'place the four.'", category:"place", available:s=>s.phase!=="point"?a(false,"Only after point is set"):s.point===4?a(false,"4 is the point — covered by Pass Line"):a(true) },
  place5:  { label:"Place 5",  houseEdge:4.0,  payout:"7:5",  trueOdds:"3:2", desc:"Bet 5 hits before 7. Slide to dealer: 'place the five.'", category:"place", available:s=>s.phase!=="point"?a(false,"Only after point is set"):s.point===5?a(false,"5 is the point — covered by Pass Line"):a(true) },
  place6:  { label:"Place 6",  houseEdge:1.52, payout:"7:6",  trueOdds:"6:5", desc:"Bet 6 hits before 7. Best place bet — multiples of $6, wins $7 each. 'Place the six.'", category:"place", decent:true, available:s=>s.phase!=="point"?a(false,"Only after point is set"):s.point===6?a(false,"6 is the point — covered by Pass Line"):a(true) },
  place8:  { label:"Place 8",  houseEdge:1.52, payout:"7:6",  trueOdds:"6:5", desc:"Bet 8 hits before 7. Best place bet — multiples of $6, wins $7 each. 'Place the eight.'", category:"place", decent:true, available:s=>s.phase!=="point"?a(false,"Only after point is set"):s.point===8?a(false,"8 is the point — covered by Pass Line"):a(true) },
  place9:  { label:"Place 9",  houseEdge:4.0,  payout:"7:5",  trueOdds:"3:2", desc:"Bet 9 hits before 7. 'Place the nine.'", category:"place", available:s=>s.phase!=="point"?a(false,"Only after point is set"):s.point===9?a(false,"9 is the point — covered by Pass Line"):a(true) },
  place10: { label:"Place 10", houseEdge:6.67, payout:"9:5",  trueOdds:"2:1", desc:"Bet 10 hits before 7. 'Place the ten.'", category:"place", available:s=>s.phase!=="point"?a(false,"Only after point is set"):s.point===10?a(false,"10 is the point — covered by Pass Line"):a(true) },
  field:   { label:"Field",    houseEdge:5.56, payout:"1:1 (2/12→2:1)", trueOdds:"20:16", desc:"One-roll. Wins on 2,3,4,9,10,11,12; loses on 5,6,7,8. Place your own chip.", category:"one-roll", available:()=>a(true) },
  any7:    { label:"Any Seven", houseEdge:16.67, payout:"4:1", trueOdds:"5:1", desc:"Next roll is 7. Worst bet on the table — nearly 17% edge. Toss to stickman.", category:"prop", available:()=>a(true) },
  anyCraps:{ label:"Any Craps", houseEdge:11.11, payout:"7:1", trueOdds:"8:1", desc:"Next roll is 2, 3, or 12. Toss to stickman: 'any craps.'", category:"prop", available:()=>a(true) },
  horn:    { label:"Horn",      houseEdge:12.5,  payout:"varies", trueOdds:"varies", desc:"Split bet on 2,3,11,12. One-roll. Toss to stickman: 'horn bet.'", category:"prop", available:()=>a(true) },
  hardway4:  { label:"Hard 4",  houseEdge:11.11, payout:"7:1", trueOdds:"8:1",  desc:"2+2 before easy 4 or 7. Toss to stickman: 'hard four.'", category:"hard", available:s=>s.phase==="point"?a(true):a(false,"Only after point is set") },
  hardway6:  { label:"Hard 6",  houseEdge:9.09,  payout:"9:1", trueOdds:"10:1", desc:"3+3 before easy 6 or 7. Toss to stickman: 'hard six.'", category:"hard", available:s=>s.phase==="point"?a(true):a(false,"Only after point is set") },
  hardway8:  { label:"Hard 8",  houseEdge:9.09,  payout:"9:1", trueOdds:"10:1", desc:"4+4 before easy 8 or 7. Toss to stickman: 'hard eight.'", category:"hard", available:s=>s.phase==="point"?a(true):a(false,"Only after point is set") },
  hardway10: { label:"Hard 10", houseEdge:11.11, payout:"7:1", trueOdds:"8:1",  desc:"5+5 before easy 10 or 7. Toss to stickman: 'hard ten.'", category:"hard", available:s=>s.phase==="point"?a(true):a(false,"Only after point is set") },
};

const CHIP_DENOMS = [1,5,25,100,500];
const CAT_LABELS = { primary:"Main Bets", odds:"True Odds — 0% Edge", place:"Place Bets", "one-roll":"One-Roll Bets", prop:"Proposition Bets", hard:"Hardways" };
const getEdgeColor = e => e===0?"#00c875":e<2?"#4fc3f7":e<5?"#ffb74d":"#ef5350";
const getEdgeLabel = e => e===0?"★ 0%":e<2?"✓ Low":e<5?"~ Med":"✗ High";

// ─── Main Game ────────────────────────────────────────────────────────────────

export default function CrapsGame() {
  const [balance, setBalance]           = useState(500);
  const [bets, setBets]                 = useState({});
  // comeBets: { [number]: { base, odds } } — Come bets that have traveled to a number
  const [comeBets, setComeBets]         = useState({});
  // pendingCome / pendingDontCome — flat bet waiting for its first come-out roll
  const [pendingCome, setPendingCome]   = useState(0);
  const [pendingDontCome, setPendingDontCome] = useState(0);
  const [phase, setPhase]               = useState("comeout");
  const [point, setPoint]               = useState(null);
  const [dice, setDice]                 = useState([1,6]);
  const [rolling, setRolling]           = useState(false);
  const [wager, setWager]               = useState(0);  // accumulated bet amount built from chip tray
  const [lastChip, setLastChip]         = useState(null); // most recently added chip denomination
  const [oddsMultiplier, setOddsMultiplier] = useState(3);
  const [history, setHistory]           = useState([]);
  const [msg, setMsg]                   = useState({ text:"Place your bets! Come-out roll.", type:"info" });
  const [expanded, setExpanded]         = useState({ primary:true, odds:true, place:false, "one-roll":false, prop:false, hard:false });
  const [betInfo, setBetInfo]           = useState(null);
  const [showGuide, setShowGuide]       = useState(false);

  const comeTotal = Object.values(comeBets).reduce((s,cb)=>s+cb.base+cb.odds,0);
  const totalBets = Object.values(bets).reduce((s,b)=>s+b,0) + pendingCome + pendingDontCome + comeTotal;
  const gs = { phase, point, bets, oddsMultiplier, comeBets, pendingCome, pendingDontCome };

  const addChip = useCallback((amt) => {
    if (rolling) return;
    if (balance < wager + amt) return;
    setWager(p => p + amt);
    setLastChip(amt);
  }, [rolling, balance, wager]);

  const removeChip = useCallback(() => {
    if (!lastChip || wager < lastChip) return;
    const next = wager - lastChip;
    setWager(next);
    // recalculate lastChip — if wager still > 0 keep same denom, else null
    if (next === 0) setLastChip(null);
  }, [lastChip, wager]);

  const clearWager = useCallback(() => { setWager(0); setLastChip(null); }, []);

  // For Come odds bet: we add odds to a specific come-bet number
  const placeComeOdds = useCallback((num) => {
    if (rolling) return;
    const cb = comeBets[num];
    if (!cb) return;
    const maxOdds = cb.base * oddsMultiplier;
    const remaining = maxOdds - cb.odds;
    if (remaining <= 0) return;
    const add = Math.min(wager || 5, remaining);
    if (balance < add) { setMsg({ text:"Insufficient balance!", type:"lose" }); return; }
    setComeBets(p=>({ ...p, [num]: { ...p[num], odds: p[num].odds + add } }));
    setBalance(p=>p-add);
    // wager stays sticky
  }, [rolling, comeBets, oddsMultiplier, wager, balance]);

  const removeComeOdds = useCallback((num) => {
    if (rolling) return;
    const cb = comeBets[num];
    if (!cb || cb.odds===0) return;
    setBalance(p=>p+cb.odds);
    setComeBets(p=>({ ...p, [num]: { ...p[num], odds:0 } }));
  }, [rolling, comeBets]);

  const placeBet = useCallback((key) => {
    if (rolling) return;
    if (wager <= 0) { setMsg({ text:"Build a wager first — click the chips below.", type:"info" }); return; }
    const def = BETS[key];
    const check = def?.available(gs);
    if (!check?.ok) return;
    if (balance < wager) { setMsg({ text:"Insufficient balance!", type:"lose" }); return; }

    // Enforce odds cap for passOdds / dontPassOdds
    if (key==="passOdds") {
      const max = (bets.passLine||0) * oddsMultiplier;
      const current = bets.passOdds||0;
      const add = Math.min(wager, max-current);
      if (add<=0) return;
      setBets(p=>({...p, passOdds:(p.passOdds||0)+add}));
      setBalance(p=>p-add);
      setBetInfo(key); return;
    }
    if (key==="dontPassOdds") {
      const max = (bets.dontPass||0) * oddsMultiplier;
      const current = bets.dontPassOdds||0;
      const add = Math.min(wager, max-current);
      if (add<=0) return;
      setBets(p=>({...p, dontPassOdds:(p.dontPassOdds||0)+add}));
      setBalance(p=>p-add);
      setBetInfo(key); return;
    }

    // Come / Don't Come go into pending state
    if (key==="come") {
      setPendingCome(p=>p+wager);
      setBalance(p=>p-wager);
      setBetInfo(key); return;
    }
    if (key==="dontCome") {
      setPendingDontCome(p=>p+wager);
      setBalance(p=>p-wager);
      setBetInfo(key); return;
    }

    setBets(p=>({...p,[key]:(p[key]||0)+wager}));
    setBalance(p=>p-wager);
    setBetInfo(key);
  }, [rolling, gs, wager, balance, bets, oddsMultiplier]);

  const removeBet = useCallback((key) => {
    if (rolling) return;
    const amt = bets[key]||0;
    if (!amt) return;
    setBets(p=>{ const n={...p}; delete n[key]; return n; });
    setBalance(p=>p+amt);
  }, [rolling, bets]);

  const rollDice = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setMsg({ text:"Rolling...", type:"info" });
    setTimeout(()=>{
      const d1=Math.floor(Math.random()*6)+1;
      const d2=Math.floor(Math.random()*6)+1;
      setDice([d1,d2]);
      setRolling(false);
      resolveRoll(d1,d2,d1+d2);
    },1100);
  },[rolling,phase,point,bets,comeBets,pendingCome,pendingDontCome]);

  const resolveRoll = useCallback((d1, d2, total) => {
    let nb={...bets}; let nc={...comeBets}; let winAmt=0;
    let wins=[]; let losses=[]; let pushes=[];

    const pay  = (k,r)=>{ const am=nb[k]||0; if(am>0){ const w=Math.floor(am*r); winAmt+=w+am; delete nb[k]; wins.push(`+$${w} ${BETS[k]?.label}`); }};
    const lose = (k)  =>{ const am=nb[k]||0; if(am>0){ losses.push(`-$${am} ${BETS[k]?.label}`); delete nb[k]; }};
    const push = (k)  =>{ const am=nb[k]||0; if(am>0){ winAmt+=am; delete nb[k]; pushes.push(`Push $${am} ${BETS[k]?.label}`); }};
    const isHard = n=>d1===d2&&d1+d2===n;

    let type="roll", headline=`Rolled ${total}`, roundEnds=false, nextPhase=phase, nextPoint=point;

    // ── Come-out phase ──────────────────────────────────────────────────────
    if (phase==="comeout") {
      if (total===7||total===11) {
        pay("passLine",1); lose("dontPass");
        const playerWon = nb.passLine > 0 || (!nb.passLine && !nb.dontPass);
        const msgType = nb.dontPass > 0 ? "lose" : "win";
        type="natural";
        headline = total===7 ? "Natural 7" : "Natural 11";
        headline += nb.dontPass > 0 ? " — Don't Pass loses" : nb.passLine > 0 ? " — Pass Line wins!" : " — Natural!";
        roundEnds=true; nextPhase="comeout"; nextPoint=null;
        // place bets survive but are off
        const heldNat = ["place4","place5","place6","place8","place9","place10"].filter(k=>nb[k]>0).map(k=>`${BETS[k]?.label}`);
        if (heldNat.length) headline += ` · ${heldNat.join(", ")} held`;
        setMsg({ text:`${total}! Natural — ${nb.passLine>0?"Pass Line wins!":nb.dontPass>0?"Don't Pass loses.":"Natural!"}`, type: msgType });
      } else if (total===2||total===3) {
        lose("passLine"); pay("dontPass",1);
        const msgType = nb.dontPass > 0 ? "win" : "lose";
        type="craps";
        headline = `${total} — Craps! ${nb.dontPass>0?"Don't Pass wins!":nb.passLine>0?"Pass Line loses.":"Round over."}`;
        roundEnds=true; nextPhase="comeout"; nextPoint=null;
        setMsg({ text:`${total} — Craps! ${nb.dontPass>0?"Don't Pass wins!":"Pass Line loses."}`, type: msgType });
      } else if (total===12) {
        lose("passLine"); push("dontPass");
        type="craps_push"; headline="12 — Craps! Don't Pass pushes, Pass Line loses.";
        roundEnds=true; nextPhase="comeout"; nextPoint=null;
        setMsg({ text:"12 — Craps! Don't Pass pushes.", type: nb.passLine>0?"lose":"push" });
      } else {
        // Point established
        // If there's a place bet on this number, refund it — can't have both
        const placeKey = `place${total}`;
        if (nb[placeKey]) {
          const refund = nb[placeKey];
          winAmt += refund;
          delete nb[placeKey];
          pushes.push(`Refunded $${refund} Place ${total} — now covered by Pass Line`);
        }
        setPoint(total); setPhase("point"); nextPhase="point"; nextPoint=total;
        setMsg({ text:`Point is ${total}. Roll it before 7!`, type:"info" });
        const newlyAvail=[];
        if (nb.passLine)  newlyAvail.push("★ True Odds on Pass Line");
        if (nb.dontPass)  newlyAvail.push("★ Don't Pass Odds");
        newlyAvail.push("Come / Don't Come");
        const placeable=[4,5,6,8,9,10].filter(n=>n!==total);
        if (placeable.length) newlyAvail.push(`Place ${placeable.join(", ")}`);
        newlyAvail.push("Hardways");
        // Note any held-over place bets now back in play
        const heldBack = ["place4","place5","place6","place8","place9","place10"]
          .filter(k=>nb[k]>0)
          .map(k=>`${BETS[k]?.label} $${nb[k]}`);
        const headline = heldBack.length
          ? `Point set: ${total} · Held bets back on: ${heldBack.join(", ")}`
          : `Point set: ${total}`;
        const net = winAmt - Object.values(bets).reduce((s,v)=>s+v,0) + Object.values(nb).reduce((s,v)=>s+v,0);
        setHistory(p=>[{ roll:[d1,d2],total,type:"pointSet",headline,wins:[],losses:[],pushes,net,roundEnds:false,nextPhase:"point",nextPoint:total,newBets:newlyAvail },...p.slice(0,19)]);
        setBets(nb); setComeBets(nc); setBalance(p=>p+winAmt); return;
      }
    }

    // ── Point phase ─────────────────────────────────────────────────────────
    else {
      if (total===7) {
        // Pass Line / Odds lose
        lose("passLine"); lose("passOdds");
        // Don't Pass / Odds win
        pay("dontPass",1); pay("dontPassOdds",1);
        // Place bets lose
        ["place4","place5","place6","place8","place9","place10"].forEach(k=>lose(k));
        // Hardways lose
        ["hardway4","hardway6","hardway8","hardway10"].forEach(k=>lose(k));
        // Don't Come wins
        if (pendingDontCome>0){ winAmt+=pendingDontCome*2; wins.push(`+$${pendingDontCome} Don't Come (natural)`); }
        // Come bets in number boxes lose their base; odds are RETURNED (standard Vegas rule)
        Object.entries(nc).forEach(([num,cb])=>{
          losses.push(`-$${cb.base} Come on ${num}`);
          if (cb.odds>0){ winAmt+=cb.odds; pushes.push(`Odds returned $${cb.odds} (Come ${num})`); }
        });
        nc={};
        // Pending Come loses on 7
        if (pendingCome>0) losses.push(`-$${pendingCome} Come (7-out before traveling)`);
        type="sevenOut"; headline="7-Out — round over"; roundEnds=true; nextPhase="comeout"; nextPoint=null;
        setPoint(null); setPhase("comeout");
        setMsg({ text:"7-Out! Pass Line loses. New come-out.", type:"lose" });
      } else if (total===point) {
        // Point made — Pass Line wins, place bets STAY on table (go off during come-out)
        pay("passLine",1);
        const oa=nb.passOdds||0;
        if (oa>0){ const w=Math.floor(oa*ODDS_PAYOUT[point]); winAmt+=w+oa; delete nb.passOdds; wins.push(`+$${w} Pass Odds`); }
        lose("dontPass"); lose("dontPassOdds");
        // Note any place/hardway bets that are held over for the next round
        const heldOver = ["place4","place5","place6","place8","place9","place10","hardway4","hardway6","hardway8","hardway10"]
          .filter(k=>nb[k]>0)
          .map(k=>`${BETS[k]?.label} $${nb[k]}`);
        if (heldOver.length) pushes.push(`Held over: ${heldOver.join(", ")} (off during come-out)`);
        type="pointMade"; headline=`${total} — Point made! Round over`; roundEnds=true; nextPhase="comeout"; nextPoint=null;
        setPoint(null); setPhase("comeout");
        const msgType = nb.dontPass > 0 ? "lose" : "win";
        setMsg({ text:`${total}! Point made — Pass Line wins!`, type: msgType });
      } else {
        headline=`Rolled ${total} — no decision on point ${point}`;
      }

      // ── Place bets ─────────────────────────────────────────────────────
      const pp={4:9/5,5:7/5,6:7/6,8:7/6,9:7/5,10:9/5};
      if (nb[`place${total}`]&&total!==7) pay(`place${total}`,pp[total]||1);

      // ── Hardways ───────────────────────────────────────────────────────
      if (total===4){ if(isHard(4)) pay("hardway4",7); else lose("hardway4"); }
      if (total===6){ if(isHard(6)) pay("hardway6",9); else lose("hardway6"); }
      if (total===8){ if(isHard(8)) pay("hardway8",9); else lose("hardway8"); }
      if (total===10){ if(isHard(10)) pay("hardway10",7); else lose("hardway10"); }

      // ── Pending Come bet resolution ────────────────────────────────────
      if (pendingCome>0) {
        if (total===7||total===11) {
          // Come natural
          winAmt+=pendingCome*2; wins.push(`+$${pendingCome} Come (natural ${total})`);
        } else if (total===2||total===3||total===12) {
          // Come craps
          losses.push(`-$${pendingCome} Come (craps ${total})`);
        } else {
          // Come travels to number
          nc[total]={ base: (nc[total]?.base||0)+pendingCome, odds: nc[total]?.odds||0 };
          wins.push(`Come bet traveled to ${total} — take odds!`);
        }
      }

      // ── Pending Don't Come resolution ──────────────────────────────────
      if (pendingDontCome>0) {
        if (total===7||total===11) {
          losses.push(`-$${pendingDontCome} Don't Come (natural ${total})`);
        } else if (total===2||total===3) {
          winAmt+=pendingDontCome*2; wins.push(`+$${pendingDontCome} Don't Come (craps ${total})`);
        } else if (total===12) {
          winAmt+=pendingDontCome; pushes.push(`Push $${pendingDontCome} Don't Come (12)`);
        } else {
          // Don't Come travels to number — now it wins if 7 before that number
          // Store as negative (don't come) — simplified: track in comeBets with negative base
          nc[`dc${total}`]={ base: pendingDontCome, odds:0, isDont:true, num:total };
          wins.push(`Don't Come traveled to ${total}`);
        }
      }

      // ── Come bets already in number boxes ─────────────────────────────
      Object.entries(nc).forEach(([key,cb])=>{
        if (cb.isDont) {
          // Don't Come: win if 7 (handled above), lose if number hits
          if (Number(cb.num)===total) {
            losses.push(`-$${cb.base} Don't Come on ${cb.num} (lost)`);
            if (cb.odds>0){ losses.push(`-$${cb.odds} Don't Come Odds on ${cb.num}`); }
            delete nc[key];
          }
        } else {
          const num=Number(key);
          if (num===total) {
            // Come bet wins
            winAmt+=cb.base*2; wins.push(`+$${cb.base} Come on ${num} wins`);
            if (cb.odds>0){ const w=Math.floor(cb.odds*ODDS_PAYOUT[num]); winAmt+=w+cb.odds; wins.push(`+$${w} Come Odds on ${num}`); }
            delete nc[num];
          }
          // 7 case already handled above
        }
      });
    }

    // ── One-roll / prop bets (always resolve) ────────────────────────────
    if (nb.field){ if([2,3,4,9,10,11,12].includes(total)) pay("field",(total===2||total===12)?2:1); else lose("field"); }
    if (nb.any7)    { if(total===7) pay("any7",4);    else lose("any7"); }
    if (nb.anyCraps){ if([2,3,12].includes(total)) pay("anyCraps",7); else lose("anyCraps"); }
    if (nb.horn)    { if([2,3,11,12].includes(total)) pay("horn",total===2||total===12?27/4:15/4); else lose("horn"); }

    const totalWagered = Object.values(bets).reduce((s,v)=>s+v,0)+pendingCome+pendingDontCome+comeTotal;
    const totalRemaining = Object.values(nb).reduce((s,v)=>s+v,0)+Object.values(nc).reduce((s,cb)=>s+cb.base+cb.odds,0);
    const net = winAmt - totalWagered + totalRemaining;

    let newBets=[];
    if (roundEnds && nextPhase==="comeout") newBets=["Pass Line","Don't Pass"];

    setHistory(p=>[{ roll:[d1,d2],total,type,headline,wins,losses,pushes,net,roundEnds,nextPhase,nextPoint,newBets },...p.slice(0,19)]);
    setBets(nb);
    setComeBets(nc);
    setPendingCome(0);
    setPendingDontCome(0);
    setBalance(p=>p+winAmt);
  }, [phase,point,bets,comeBets,pendingCome,pendingDontCome,comeTotal,oddsMultiplier]);

  const mc = { win:{bg:"#1a4a2e",b:"#00c875",t:"#00ff99"}, lose:{bg:"#4a1a1a",b:"#ef5350",t:"#ff8a80"}, push:{bg:"#2a2a1a",b:"#ffb74d",t:"#ffe082"}, info:{bg:"#1a2a4a",b:"#4fc3f7",t:"#b3e5fc"} }[msg.type]||{bg:"#1a2a4a",b:"#4fc3f7",t:"#b3e5fc"};

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", fontFamily:"'Oswald',sans-serif", color:WHITE, display:"flex", flexDirection:"column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet"/>
      {showGuide && <GuideModal onClose={()=>setShowGuide(false)}/>}

      {/* Header */}
      <div style={{ background:"linear-gradient(90deg,#0a0a0a 0%,#1a1208 50%,#0a0a0a 100%)", borderBottom:`2px solid ${GOLD}`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:GOLD_LIGHT, letterSpacing:4 }}>♣ CRAPS ♦</div>
        <div style={{ display:"flex", gap:20, alignItems:"center" }}>
          {[["BALANCE",`$${balance.toLocaleString()}`,balance>0?GOLD_LIGHT:"#ef5350"],["WAGERED",`$${totalBets}`,totalBets>0?"#ffb74d":TEXT_MUTED],["POINT",point||"–",point?"#ff6b6b":TEXT_MUTED]].map(([lbl,val,col])=>(
            <div key={lbl} style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:TEXT_MUTED,letterSpacing:2}}>{lbl}</div>
              <div style={{fontSize:20,color:col,fontWeight:700}}>{val}</div>
            </div>
          ))}
          {/* Odds multiplier selector */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:TEXT_MUTED,letterSpacing:2,marginBottom:4}}>ODDS LIMIT</div>
            <div style={{display:"flex",gap:4}}>
              {[3,5,10].map(m=>(
                <button key={m} onClick={()=>setOddsMultiplier(m)} style={{ background:oddsMultiplier===m?"#00c87533":"transparent", border:`1px solid ${oddsMultiplier===m?"#00c875":"#444"}`, borderRadius:4, color:oddsMultiplier===m?"#00c875":"#888", padding:"3px 8px", cursor:"pointer", fontSize:11, fontFamily:"'Oswald',sans-serif" }}>{m}x</button>
              ))}
            </div>
          </div>
          <button onClick={()=>setShowGuide(true)} style={{ background:"none", border:`1px solid ${GOLD}88`, borderRadius:6, color:GOLD_LIGHT, padding:"6px 14px", cursor:"pointer", fontSize:12, fontFamily:"'Oswald',sans-serif", letterSpacing:1 }}>📖 CASINO GUIDE</button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

        {/* LEFT: Bet Panel */}
        <div style={{ width:284, flexShrink:0, background:"#0d0d0d", borderRight:`1px solid ${GOLD}44`, overflowY:"auto", padding:"12px 0" }}>
          <div style={{ padding:"0 12px 8px", fontSize:10, color:TEXT_MUTED, letterSpacing:3, borderBottom:"1px solid #333" }}>AVAILABLE BETS</div>
          {Object.keys(CAT_LABELS).map(cat=>{
            const catBets=Object.entries(BETS).filter(([,d])=>d.category===cat);
            const hasAny=catBets.some(([,d])=>d.available(gs).ok);
            const isExp=expanded[cat];
            const isOdds=cat==="odds";
            return (
              <div key={cat}>
                <div onClick={()=>setExpanded(p=>({...p,[cat]:!p[cat]}))} style={{ padding:"8px 12px", background:isExp?"#1a1a1a":"transparent", borderBottom:"1px solid #222", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", opacity:hasAny?1:0.4 }}>
                  <span style={{fontSize:11,fontWeight:600,letterSpacing:1,color:isOdds?"#00c875":GOLD}}>{CAT_LABELS[cat]}</span>
                  <span style={{color:TEXT_MUTED,fontSize:10}}>{isExp?"▲":"▼"}</span>
                </div>
                {isExp&&(
                  <>
                    {isOdds&&<OddsDetailPanel point={point} oddsMultiplier={oddsMultiplier} passLineBet={bets.passLine||0} passOddsBet={bets.passOdds||0}/>}
                    {catBets.map(([key,def])=>{
                      const check=def.available(gs);
                      const avail=check.ok;
                      const amt=bets[key]||0;
                      const active=amt>0;
                      return (
                        <div key={key} onClick={()=>avail&&placeBet(key)} onMouseEnter={()=>setBetInfo(key)}
                          style={{ padding:"8px 12px", borderBottom:"1px solid #1a1a1a", cursor:avail?"pointer":"not-allowed", opacity:avail?1:0.4, background:active?"#1a2a1a":betInfo===key?"#161616":"transparent", borderLeft:active?`3px solid ${getEdgeColor(def.houseEdge)}`:"3px solid transparent", transition:"background 0.15s" }}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,fontWeight:active?600:400,color:active?"#fff":"#ccc"}}>{def.label}</span>
                                {def.best&&<span style={{fontSize:9,background:"#00c87533",color:"#00c875",padding:"1px 4px",borderRadius:3}}>BEST</span>}
                                {def.decent&&<span style={{fontSize:9,background:"#4fc3f733",color:"#4fc3f7",padding:"1px 4px",borderRadius:3}}>GOOD</span>}
                              </div>
                              {!avail&&check.reason
                                ? <div style={{fontSize:10,color:"#666",marginTop:2,fontStyle:"italic"}}>{check.reason}</div>
                                : <div style={{display:"flex",gap:8,marginTop:3}}>
                                    <span style={{fontSize:10,color:getEdgeColor(def.houseEdge)}}>{getEdgeLabel(def.houseEdge)}: {def.houseEdge}%</span>
                                    <span style={{fontSize:10,color:TEXT_MUTED}}>Pays {def.payout}</span>
                                  </div>
                              }
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              {active?(
                                <div>
                                  <div style={{fontSize:13,color:GOLD_LIGHT,fontWeight:700}}>${amt}</div>
                                  <div onClick={e=>{e.stopPropagation();removeBet(key);}} style={{fontSize:9,color:"#ef5350",cursor:"pointer",letterSpacing:1}}>REMOVE</div>
                                </div>
                              ):avail?<div style={{fontSize:10,color:wager>0?"#4fc3f7":"#444"}}>{wager>0?`place $${wager}`:"set wager ↓"}</div>:null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* CENTER */}
        <div style={{ flex:1, background:`radial-gradient(ellipse at center,${FELT} 0%,${FELT_DARK} 100%)`, display:"flex", flexDirection:"column", alignItems:"center", padding:"20px", gap:14, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.05, backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize:"12px 12px", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:12, border:`3px solid ${GOLD}66`, borderRadius:24, pointerEvents:"none" }}/>

          <div style={{ background:"#00000066", border:`1px solid ${GOLD}88`, borderRadius:8, padding:"6px 20px", fontSize:13, letterSpacing:3, color:GOLD_LIGHT }}>
            {phase==="comeout"?"◈ COME-OUT ROLL":`◉ POINT: ${point}`}
          </div>

          <div style={{ background:"#00000033", border:`2px solid ${GOLD}44`, borderRadius:20, padding:"24px 40px", display:"flex", flexDirection:"column", alignItems:"center", gap:16, minWidth:280 }}>
            <div style={{display:"flex",gap:20,alignItems:"center"}}>
              <Die value={dice[0]} rolling={rolling}/>
              <div style={{fontSize:28,color:GOLD,opacity:0.6}}>+</div>
              <Die value={dice[1]} rolling={rolling}/>
              {!rolling&&<div style={{fontSize:28,color:GOLD,opacity:0.6}}>= <span style={{color:GOLD_LIGHT,fontWeight:700}}>{dice[0]+dice[1]}</span></div>}
            </div>
            <div style={{ background:mc.bg, border:`1px solid ${mc.b}`, borderRadius:8, padding:"8px 20px", textAlign:"center", fontSize:13, color:mc.t, minWidth:240 }}>{msg.text}</div>
            <button onClick={rollDice} disabled={rolling} style={{ background:rolling?"#333":`linear-gradient(135deg,${GOLD} 0%,#8b6914 100%)`, border:"none", borderRadius:8, color:rolling?"#666":"#1a0a00", fontSize:14, fontWeight:700, padding:"12px 40px", cursor:rolling?"not-allowed":"pointer", letterSpacing:3, fontFamily:"'Oswald',sans-serif", boxShadow:rolling?"none":`0 4px 20px ${GOLD}66`, transition:"all 0.2s" }}>
              {rolling?"ROLLING...":"ROLL DICE"}
            </button>
          </div>

          {/* Chip tray — sticky wager, click chips to add, +/- to adjust */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,width:"100%",maxWidth:420}}>
            {/* Wager display with nudge controls */}
            <div style={{display:"flex",alignItems:"center",gap:8,width:"100%",justifyContent:"center"}}>
              {/* Remove one chip */}
              <button
                onClick={removeChip}
                disabled={!lastChip || wager < lastChip}
                style={{
                  width:34, height:34, borderRadius:"50%",
                  background:"none", border:`1px solid ${lastChip&&wager>=lastChip?"#ef535088":"#333"}`,
                  color: lastChip&&wager>=lastChip?"#ef5350":"#444",
                  fontSize:18, cursor: lastChip&&wager>=lastChip?"pointer":"not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.15s", flexShrink:0,
                  fontFamily:"'Oswald',sans-serif",
                }}>−</button>

              {/* Wager amount */}
              <div style={{
                background:"#00000066", border:`1px solid ${wager>0?GOLD+"88":"#333"}`,
                borderRadius:8, padding:"6px 0", minWidth:130, textAlign:"center",
                transition:"border-color 0.2s", flex:1, maxWidth:160,
              }}>
                <div style={{fontSize:10,color:TEXT_MUTED,letterSpacing:2,marginBottom:2}}>WAGER</div>
                <div style={{fontSize:22,color:wager>0?GOLD_LIGHT:"#444",fontWeight:700,transition:"color 0.2s"}}>
                  {wager>0?`$${wager}`:"—"}
                </div>
                {lastChip&&wager>0&&(
                  <div style={{fontSize:9,color:"#555",marginTop:1}}>−/+ ${lastChip}</div>
                )}
              </div>

              {/* Add one chip */}
              <button
                onClick={()=>lastChip&&addChip(lastChip)}
                disabled={!lastChip || balance < wager + (lastChip||0)}
                style={{
                  width:34, height:34, borderRadius:"50%",
                  background:"none", border:`1px solid ${lastChip&&balance>=wager+(lastChip||0)?"#00c87588":"#333"}`,
                  color: lastChip&&balance>=wager+(lastChip||0)?"#00c875":"#444",
                  fontSize:18, cursor: lastChip&&balance>=wager+(lastChip||0)?"pointer":"not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.15s", flexShrink:0,
                  fontFamily:"'Oswald',sans-serif",
                }}>+</button>

              {/* Clear */}
              {wager>0&&(
                <button onClick={clearWager} style={{
                  background:"none", border:"1px solid #ef535044", borderRadius:6,
                  color:"#ef535088", padding:"4px 8px", cursor:"pointer",
                  fontSize:10, fontFamily:"'Oswald',sans-serif", letterSpacing:1, flexShrink:0,
                }}>CLR</button>
              )}
            </div>

            {/* Chip tray */}
            <div style={{fontSize:10,color:TEXT_MUTED,letterSpacing:2}}>
              {wager>0 ? "CLICK A BET ON THE LEFT TO PLACE" : "CLICK CHIPS TO SET WAGER"}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {CHIP_DENOMS.map(d=>{
                const canAdd = balance >= wager + d;
                const isLast = d === lastChip;
                return (
                  <div key={d} onClick={()=>canAdd&&addChip(d)} style={{
                    transform: isLast ? "scale(1.15) translateY(-3px)" : canAdd ? "scale(1)" : "scale(0.9)",
                    opacity: canAdd ? 1 : 0.3,
                    transition: "transform 0.15s, opacity 0.2s",
                    cursor: canAdd ? "pointer" : "not-allowed",
                    filter: isLast ? `drop-shadow(0 0 6px ${GOLD})` : "none",
                  }}>
                    <Chip amount={d}/>
                  </div>
                );
              })}
            </div>
          </div>

          <ContextTip phase={phase} point={point} bets={bets} oddsMultiplier={oddsMultiplier} onOpenGuide={()=>setShowGuide(true)}/>

          {/* Active bets — including come bets */}
          {(Object.keys(bets).length>0||pendingCome>0||pendingDontCome>0||Object.keys(comeBets).length>0)&&(
            <div style={{ background:"#00000044", border:`1px solid ${GOLD}44`, borderRadius:12, padding:"12px 16px", display:"flex", flexWrap:"wrap", gap:8, maxWidth:460, justifyContent:"center" }}>
              <div style={{width:"100%",fontSize:10,color:TEXT_MUTED,letterSpacing:2,textAlign:"center",marginBottom:4}}>ACTIVE BETS</div>
              {Object.entries(bets).map(([key,amt])=>(
                <div key={key} style={{background:"#1a2a1a",border:"1px solid #00c87566",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#00c875"}}>{BETS[key]?.label}: <strong>${amt}</strong></div>
              ))}
              {pendingCome>0&&(
                <div style={{background:"#1a1a2a",border:"1px solid #4fc3f766",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#4fc3f7"}}>Come (pending): <strong>${pendingCome}</strong></div>
              )}
              {pendingDontCome>0&&(
                <div style={{background:"#1a1a2a",border:"1px solid #9575cd66",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#9575cd"}}>Don't Come (pending): <strong>${pendingDontCome}</strong></div>
              )}
              {Object.entries(comeBets).map(([num,cb])=>{
                const maxOdds=cb.base*oddsMultiplier;
                const remaining=maxOdds-cb.odds;
                return (
                  <div key={num} style={{background:"#1a2a1a",border:"1px solid #4db6ac66",borderRadius:6,padding:"4px 10px",fontSize:11,color:"#4db6ac",display:"flex",flexDirection:"column",gap:2}}>
                    <div>Come on {num}: <strong>${cb.base}</strong>{cb.isDont?" (Don't)":""}</div>
                    {!cb.isDont&&(
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#00c875"}}>Odds: ${cb.odds}/{maxOdds} ({ODDS_LABEL[num]})</span>
                        {remaining>0&&(
                          <span onClick={()=>placeComeOdds(Number(num))} style={{fontSize:9,color:"#00c875",cursor:"pointer",background:"#00c87522",padding:"1px 5px",borderRadius:3}}>+odds</span>
                        )}
                        {cb.odds>0&&(
                          <span onClick={()=>removeComeOdds(Number(num))} style={{fontSize:9,color:"#ef5350",cursor:"pointer"}}>remove</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bet detail */}
          {betInfo&&BETS[betInfo]&&(
            <div style={{ background:"#111", border:`1px solid ${GOLD}66`, borderRadius:10, padding:"10px 16px", maxWidth:400, width:"100%", fontSize:11, color:"#ccc", lineHeight:1.5 }}>
              <div style={{color:GOLD_LIGHT,fontWeight:600,marginBottom:4}}>{BETS[betInfo].label}</div>
              {(()=>{ const check=BETS[betInfo].available(gs); return !check.ok&&check.reason?<div style={{color:"#ef9a9a",marginBottom:6,fontStyle:"italic"}}>Not available: {check.reason}</div>:null; })()}
              <div style={{color:"#aaa",marginBottom:6}}>{BETS[betInfo].desc}</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <span style={{color:getEdgeColor(BETS[betInfo].houseEdge)}}>Edge: {BETS[betInfo].houseEdge}%</span>
                <span style={{color:TEXT_MUTED}}>True odds: {BETS[betInfo].trueOdds}</span>
                <span style={{color:TEXT_MUTED}}>Pays: {BETS[betInfo].payout}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: History */}
        <div style={{ width:220, flexShrink:0, background:"#0d0d0d", borderLeft:`1px solid ${GOLD}44`, padding:"12px 0", overflowY:"auto" }}>
          <div style={{ padding:"0 12px 8px", fontSize:10, color:TEXT_MUTED, letterSpacing:3, borderBottom:"1px solid #333" }}>ROLL HISTORY</div>
          {history.length===0&&<div style={{padding:16,fontSize:11,color:"#444",textAlign:"center"}}>No rolls yet</div>}
          {history.map((h,i)=>{
            const ts={
              natural:    { badge:"NATURAL",    bc:"#00c875", bg:"#0d1f14" },
              craps:      { badge:"CRAPS",       bc:"#ef5350", bg:"#1f0d0d" },
              craps_push: { badge:"CRAPS PUSH",  bc:"#ffb74d", bg:"#1f1a0d" },
              pointSet:   { badge:"POINT SET",   bc:"#4fc3f7", bg:"#0d1520" },
              pointMade:  { badge:"POINT MADE",  bc:"#00c875", bg:"#0d1f14" },
              sevenOut:   { badge:"7-OUT",       bc:"#ef5350", bg:"#1f0d0d" },
              roll:       { badge:"ROLL",        bc:"#888",    bg:"transparent" },
            }[h.type]||{ badge:"ROLL", bc:"#888", bg:"transparent" };
            const hasOutcome=h.wins.length||h.losses.length||h.pushes.length;
            const netColor=h.net>0?"#00c875":h.net<0?"#ef5350":"#ffb74d";
            return (
              <div key={i}>
                {h.roundEnds&&i>0&&(
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px"}}>
                    <div style={{flex:1,height:1,background:"#2a2a2a"}}/>
                    <span style={{fontSize:9,color:"#444",letterSpacing:1}}>NEW ROUND</span>
                    <div style={{flex:1,height:1,background:"#2a2a2a"}}/>
                  </div>
                )}
                <div style={{padding:"8px 12px",borderBottom:"1px solid #181818",background:ts.bg}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    {h.roll.map((v,j)=>(
                      <div key={j} style={{width:20,height:20,borderRadius:3,background:"#f5f0e8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#1a0a00"}}>{v}</div>
                    ))}
                    <span style={{color:GOLD_LIGHT,fontSize:13,fontWeight:700,marginRight:4}}>={h.total}</span>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:ts.bc,background:ts.bc+"22",padding:"1px 5px",borderRadius:3,border:`1px solid ${ts.bc}44`}}>{ts.badge}</span>
                  </div>
                  <div style={{fontSize:11,color:"#ccc",marginBottom:hasOutcome?5:0,lineHeight:1.4}}>{h.headline}</div>
                  {hasOutcome&&(
                    <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:4}}>
                      {h.wins.map((w,j)=><div key={j} style={{fontSize:10,color:"#00c875"}}>{w}</div>)}
                      {h.losses.map((l,j)=><div key={j} style={{fontSize:10,color:"#ef5350"}}>{l}</div>)}
                      {h.pushes.map((p,j)=><div key={j} style={{fontSize:10,color:"#ffb74d"}}>{p}</div>)}
                    </div>
                  )}
                  {hasOutcome&&(
                    <div style={{fontSize:11,fontWeight:700,color:netColor}}>
                      {h.net>0?`Net: +$${h.net}`:h.net<0?`Net: -$${Math.abs(h.net)}`:"Net: even"}
                    </div>
                  )}
                  {h.newBets?.length>0&&(
                    <div style={{marginTop:6,padding:"5px 7px",background:"#4fc3f722",border:"1px solid #4fc3f744",borderRadius:4}}>
                      <div style={{fontSize:9,color:"#4fc3f7",fontWeight:700,letterSpacing:1,marginBottom:2}}>NOW AVAILABLE</div>
                      {h.newBets.map((b,j)=><div key={j} style={{fontSize:10,color:"#90caf9"}}>· {b}</div>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background:"#080808", borderTop:"1px solid #222", padding:"8px 20px", display:"flex", gap:20, alignItems:"center", justifyContent:"center", fontSize:10, color:TEXT_MUTED, flexWrap:"wrap" }}>
        <span style={{color:"#00c875"}}>★ 0% — True Odds</span>
        <span style={{color:"#4fc3f7"}}>✓ &lt;2% — Best bets</span>
        <span style={{color:"#ffb74d"}}>~ &lt;5% — Medium</span>
        <span style={{color:"#ef5350"}}>✗ 5%+ — Avoid</span>
        <span>Odds limit: {oddsMultiplier}x · Hover bets for details · 📖 Guide for casino tips</span>
      </div>
    </div>
  );
}
