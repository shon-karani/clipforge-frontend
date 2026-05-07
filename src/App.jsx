import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DESIGN SYSTEM — Retro-Futuristic Neon Terminal
// ============================================================
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  :root{
    --bg:#020408;--surface:#060d14;--card:#0a1520;--card2:#0d1b28;
    --accent:#00ff88;--accent2:#00ccff;--accent3:#ff3366;--accent4:#ffcc00;
    --text:#e0f0ff;--muted:#4a6a8a;--border:#0f2535;
    --glow:0 0 20px rgba(0,255,136,0.3);--glow2:0 0 20px rgba(0,204,255,0.3);
  }
  html,body{background:var(--bg);color:var(--text);font-family:'Rajdhani',sans-serif;overflow-x:hidden;min-height:100vh;}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--accent);border-radius:99px;opacity:0.3;}
  ::selection{background:rgba(0,255,136,0.2);}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,255,136,0.2)}50%{box-shadow:0 0 30px rgba(0,255,136,0.5)}}
  @keyframes glowBlue{0%,100%{box-shadow:0 0 10px rgba(0,204,255,0.2)}50%{box-shadow:0 0 30px rgba(0,204,255,0.5)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes waveBar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
  @keyframes slideIn{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes radarSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes notif{from{transform:translateY(-40px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes borderRun{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  input,textarea,select{font-family:'Rajdhani',sans-serif;outline:none;}
  button{cursor:pointer;font-family:'Rajdhani',sans-serif;}
`;

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_CLIPS = [
  {id:1,title:"The ONE Habit That Changed My Life",duration:"0:52",score:97,hookScore:95,retentionScore:92,emotionalScore:88,platformFit:94,views:"3.2M",platform:"TikTok",transcript:"I started doing this every single morning and within 30 days everything changed...",tags:["Hook","Story","Transformation"],viral:true,viralProbability:94,bestTime:"7:00 PM",bestDay:"Tuesday",platformScores:{TikTok:97,Instagram:94,YouTube:89,LinkedIn:72,Twitter:81}},
  {id:2,title:"Nobody Talks About This Strategy",duration:"1:04",score:94,hookScore:98,retentionScore:88,emotionalScore:85,platformFit:91,views:"1.8M",platform:"Instagram",transcript:"Every successful entrepreneur knows this secret but they never share it publicly...",tags:["Curiosity","Business","Value"],viral:true,viralProbability:89,bestTime:"12:00 PM",bestDay:"Wednesday",platformScores:{TikTok:91,Instagram:94,YouTube:86,LinkedIn:88,Twitter:79}},
  {id:3,title:"I Was Completely Wrong About This",duration:"0:47",score:91,hookScore:89,retentionScore:94,emotionalScore:91,platformFit:88,views:"945K",platform:"YouTube",transcript:"For years I believed this was the right approach. I was completely wrong and here's why...",tags:["Vulnerability","Education","Surprise"],viral:false,viralProbability:76,bestTime:"3:00 PM",bestDay:"Thursday",platformScores:{TikTok:88,Instagram:85,YouTube:91,LinkedIn:82,Twitter:77}},
  {id:4,title:"From Zero to $50K — The Real Story",duration:"1:18",score:88,hookScore:91,retentionScore:85,emotionalScore:93,platformFit:87,views:"678K",platform:"TikTok",transcript:"Six months ago I had absolutely nothing. Here's exactly what I did step by step...",tags:["Results","Story","Money"],viral:false,viralProbability:71,bestTime:"6:00 PM",bestDay:"Friday",platformScores:{TikTok:86,Instagram:88,YouTube:84,LinkedIn:79,Twitter:75}},
  {id:5,title:"Stop Doing This Immediately",duration:"0:39",score:85,hookScore:93,retentionScore:81,emotionalScore:79,platformFit:86,views:"423K",platform:"YouTube",transcript:"If you're still doing this in 2025 you are literally leaving money on the table...",tags:["Warning","Urgency","Tips"],viral:false,viralProbability:68,bestTime:"9:00 AM",bestDay:"Monday",platformScores:{TikTok:85,Instagram:82,YouTube:87,LinkedIn:74,Twitter:80}},
];

const PLATFORMS_CONFIG = [
  {id:"tiktok",name:"TikTok",icon:"🎵",color:"#ff0050",accounts:["TikTok Main","TikTok Niche1","TikTok Niche2","TikTok Viral"],maxPerDay:3},
  {id:"instagram",name:"Instagram",icon:"📸",color:"#e1306c",accounts:["IG Main","IG Business","IG Niche1","IG Niche2","IG Viral"],maxPerDay:2},
  {id:"youtube",name:"YouTube",icon:"▶️",color:"#ff0000",accounts:["YT Main","YT Shorts","YT Niche1","YT Niche2","YT Long","YT Viral"],maxPerDay:2},
  {id:"facebook",name:"Facebook",icon:"👥",color:"#1877f2",accounts:["FB Page1","FB Page2","FB Page3","FB Page4","FB Page5"],maxPerDay:3},
  {id:"twitter",name:"X/Twitter",icon:"𝕏",color:"#1da1f2",accounts:["X Main"],maxPerDay:5},
];

const PROCESS_STAGES = [
  {label:"Uploading",icon:"⬆️",pct:8},
  {label:"Transcribing with WhisperX",icon:"🎙️",pct:20},
  {label:"Detecting viral moments",icon:"🔍",pct:35},
  {label:"Gemini Alpha scoring",icon:"🤖",pct:50},
  {label:"Gemini Beta strategy",icon:"⚡",pct:62},
  {label:"Auto-reframing 9:16",icon:"📐",pct:72},
  {label:"Burning captions",icon:"💬",pct:82},
  {label:"Generating thumbnails",icon:"🖼️",pct:90},
  {label:"Uploading to cloud",icon:"☁️",pct:96},
  {label:"Building growth plan",icon:"🚀",pct:100},
];

const GROWTH_TIPS = [
  {platform:"TikTok",tip:"Hook in first 2s is too slow. Start mid-sentence for instant grab.",priority:"CRITICAL",impact:"+43% retention",color:"#ff0050"},
  {platform:"Instagram",tip:"Post at 7PM not 2PM. Your audience peaks 5-9PM your timezone.",priority:"HIGH",impact:"+67% reach",color:"#e1306c"},
  {platform:"YouTube",tip:"Add number to title. '7 Ways...' outperforms generic titles by 31%.",priority:"HIGH",impact:"+31% CTR",color:"#ff0000"},
  {platform:"ALL",tip:"Consistency beats quality early. 3x/day for 30 days triggers algo favor.",priority:"CRITICAL",impact:"+200% growth",color:"#00ff88"},
  {platform:"TikTok",tip:"Use trending audio from past 7 days. Fresh trends = 3x algorithm boost.",priority:"MEDIUM",impact:"+89% views",color:"#ff0050"},
];

const TRENDING_AUDIO = [
  {name:"BIRDS OF A FEATHER",artist:"Billie Eilish",uses:"2.4M",trend:"+340%"},
  {name:"APT.",artist:"ROSE & Bruno Mars",uses:"1.8M",trend:"+280%"},
  {name:"Espresso",artist:"Sabrina Carpenter",uses:"3.1M",trend:"+190%"},
];

const WEEK_PLAN = [
  {day:"Mon",posts:8,focus:"Hook Testing",color:"#00ff88"},
  {day:"Tue",posts:12,focus:"Peak Day",color:"#00ccff"},
  {day:"Wed",posts:15,focus:"Authority",color:"#ff3366"},
  {day:"Thu",posts:10,focus:"Value",color:"#ffcc00"},
  {day:"Fri",posts:14,focus:"Entertainment",color:"#00ff88"},
  {day:"Sat",posts:7,focus:"Behind Scenes",color:"#00ccff"},
  {day:"Sun",posts:9,focus:"Reflection",color:"#ff3366"},
];

// ============================================================
// UI COMPONENTS
// ============================================================
function GlowBtn({children,onClick,variant="primary",size="md",icon,full=false,style={}}){
  const sz={sm:{p:"8px 16px",f:"12px"},md:{p:"11px 22px",f:"14px"},lg:{p:"14px 32px",f:"16px"}};
  const vs={
    primary:{bg:"linear-gradient(135deg,#00ff88,#00ccff)",c:"#000",shadow:"0 0 20px rgba(0,255,136,0.4)"},
    ghost:{bg:"rgba(0,255,136,0.05)",c:"#00ff88",border:"1px solid rgba(0,255,136,0.25)",shadow:"none"},
    red:{bg:"rgba(255,51,102,0.1)",c:"#ff3366",border:"1px solid rgba(255,51,102,0.25)",shadow:"none"},
    dark:{bg:"var(--card2)",c:"var(--text)",border:"1px solid var(--border)",shadow:"none"},
    gold:{bg:"rgba(255,204,0,0.1)",c:"#ffcc00",border:"1px solid rgba(255,204,0,0.25)",shadow:"none"},
  };
  const v=vs[variant]||vs.primary;
  return(
    <button onClick={onClick} style={{
      background:v.bg,color:v.c,border:v.border||"none",borderRadius:8,
      padding:sz[size].p,fontSize:sz[size].f,fontWeight:700,
      display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",
      width:full?"100%":"auto",justifyContent:full?"center":"flex-start",
      transition:"all 0.2s ease",letterSpacing:0.5,fontFamily:"'Rajdhani',sans-serif",
      boxShadow:v.shadow,...style
    }}
    onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.15)";e.currentTarget.style.transform="translateY(-1px)";}}
    onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}}>
      {icon&&<span>{icon}</span>}{children}
    </button>
  );
}

function Card({children,style={},glow=false}){
  return(
    <div style={{
      background:"var(--card)",border:"1px solid var(--border)",
      borderRadius:14,padding:18,transition:"all 0.2s ease",
      ...(glow?{boxShadow:"0 0 20px rgba(0,255,136,0.15)",borderColor:"rgba(0,255,136,0.2)"}:{}),
      ...style
    }}>{children}</div>
  );
}

function Tag({children,color="#00ff88"}){
  return(
    <span style={{background:`${color}18`,border:`1px solid ${color}30`,color,borderRadius:99,padding:"3px 10px",fontSize:10,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>
  );
}

function Toast({msg,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(2,4,8,0.97)",backdropFilter:"blur(20px)",border:"1px solid rgba(0,255,136,0.4)",borderRadius:12,padding:"12px 22px",color:"#fff",fontSize:13,fontWeight:600,zIndex:9999,whiteSpace:"nowrap",animation:"notif 0.3s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.8),0 0 30px rgba(0,255,136,0.15)",fontFamily:"'Rajdhani',sans-serif"}}>{msg}</div>
  );
}

// ============================================================
// RADAR CHART — ClipForge Score™
// ============================================================
function RadarChart({scores,size=160}){
  const labels=["Hook","Retention","Emotion","Platform","Clarity"];
  const vals=[scores.hookScore,scores.retentionScore,scores.emotionalScore,scores.platformFit,scores.score].map(v=>v/100);
  const cx=size/2,cy=size/2,r=size*0.38;
  const angle=(i)=>(i/labels.length)*Math.PI*2-Math.PI/2;
  const pt=(i,scale)=>[cx+r*scale*Math.cos(angle(i)),cy+r*scale*Math.sin(angle(i))];
  const polygon=vals.map((v,i)=>pt(i,v)).map(([x,y])=>`${x},${y}`).join(" ");
  const gridPolygon=(scale)=>labels.map((_,i)=>pt(i,scale)).map(([x,y])=>`${x},${y}`).join(" ");
  return(
    <svg width={size} height={size}>
      {[0.25,0.5,0.75,1].map(s=>(
        <polygon key={s} points={gridPolygon(s)} fill="none" stroke="rgba(0,255,136,0.08)" strokeWidth={1}/>
      ))}
      {labels.map((_,i)=>{
        const [x1,y1]=pt(i,0);const [x2,y2]=pt(i,1);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,255,136,0.1)" strokeWidth={1}/>;
      })}
      <polygon points={polygon} fill="rgba(0,255,136,0.15)" stroke="#00ff88" strokeWidth={2} strokeLinejoin="round"/>
      {vals.map((v,i)=>{
        const [x,y]=pt(i,v);
        return <circle key={i} cx={x} cy={y} r={4} fill="#00ff88" style={{filter:"drop-shadow(0 0 4px #00ff88)"}}/>;
      })}
      {labels.map((l,i)=>{
        const [x,y]=pt(i,1.22);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="rgba(0,255,136,0.7)" fontSize={9} fontFamily="'Share Tech Mono',monospace">{l}</text>;
      })}
    </svg>
  );
}

// ============================================================
// VIRAL PROBABILITY RING
// ============================================================
function ProbRing({pct,size=56}){
  const r=(size-8)/2,circ=2*Math.PI*r,dash=(pct/100)*circ;
  const c=pct>=80?"#00ff88":pct>=60?"#ffcc00":"#ff3366";
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={5} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${c})`,transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.24,fontWeight:900,color:c,fontFamily:"'Share Tech Mono',monospace"}}>{pct}</div>
    </div>
  );
}

// ============================================================
// PAGE: AUTH
// ============================================================
function AuthPage({onAuth}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",padding:16}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,255,136,0.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"30%",left:"5%",width:200,height:200,borderRadius:"50%",background:"rgba(0,255,136,0.02)",filter:"blur(60px)",animation:"float 6s ease-in-out infinite"}}/>
      <div style={{position:"absolute",bottom:"20%",right:"5%",width:150,height:150,borderRadius:"50%",background:"rgba(0,204,255,0.02)",filter:"blur(50px)",animation:"float 8s ease-in-out infinite reverse"}}/>
      <div style={{width:"100%",maxWidth:400,animation:"fadeUp 0.5s ease"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#00ff88,#00ccff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#000",fontFamily:"'Orbitron',sans-serif",margin:"0 auto 16px",boxShadow:"0 0 30px rgba(0,255,136,0.4)"}}>CF</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,fontWeight:900,color:"#fff",letterSpacing:4,marginBottom:4}}>CLIPFORGE</div>
          <div style={{fontSize:11,color:"var(--muted)",letterSpacing:3,textTransform:"uppercase"}}>AI Video Empire Builder</div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:12}}>
            {["100% Free","No Watermark","AI-Powered"].map(b=>(
              <Tag key={b} color="#00ff88">{b}</Tag>
            ))}
          </div>
        </div>
        <Card style={{padding:24}}>
          <div style={{display:"flex",background:"var(--surface)",borderRadius:10,padding:3,marginBottom:20,gap:3}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:mode===m?"linear-gradient(135deg,#00ff88,#00ccff)":"transparent",color:mode===m?"#000":"var(--muted)",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Rajdhani',sans-serif",letterSpacing:1,textTransform:"uppercase"}}>{m==="login"?"Sign In":"Sign Up"}</button>
            ))}
          </div>
          {/* Google */}
          <button onClick={onAuth} style={{width:"100%",padding:"13px",borderRadius:12,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--text)",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16,transition:"all 0.2s",fontFamily:"'Rajdhani',sans-serif",letterSpacing:0.5}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,255,136,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";}}>
            <span style={{fontSize:18,fontWeight:900,color:"#4285f4"}}>G</span> Continue with Google
          </button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{flex:1,height:1,background:"var(--border)"}}/>
            <span style={{fontSize:11,color:"var(--muted)"}}>OR</span>
            <div style={{flex:1,height:1,background:"var(--border)"}}/>
          </div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{width:"100%",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontSize:14,marginBottom:10}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password"
            style={{width:"100%",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontSize:14,marginBottom:16}}/>
          <button onClick={onAuth} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#00ff88,#00ccff)",color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",letterSpacing:0.5,fontFamily:"'Rajdhani',sans-serif",boxShadow:"0 0 20px rgba(0,255,136,0.3)"}}>
            {mode==="login"?"SIGN IN TO CLIPFORGE →":"CREATE FREE ACCOUNT →"}
          </button>
          <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"var(--muted)"}}>
            Join 50,000+ creators · 100% free · No credit card
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM NAV
// ============================================================
function BottomNav({page,setPage}){
  const tabs=[
    {id:"dashboard",icon:"⚡",label:"Home"},
    {id:"upload",icon:"🎬",label:"Upload"},
    {id:"clips",icon:"✂️",label:"Clips"},
    {id:"growth",icon:"🚀",label:"Growth"},
    {id:"profile",icon:"👤",label:"Profile"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,13,20,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid var(--border)",display:"flex",zIndex:1000,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {tabs.map(t=>{
        const active=page===t.id;
        return(
          <button key={t.id} onClick={()=>setPage(t.id)} style={{flex:1,padding:"10px 4px 8px",border:"none",background:"transparent",color:active?"#00ff88":"var(--muted)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s",minHeight:56}}>
            <span style={{fontSize:20,filter:active?"drop-shadow(0 0 6px #00ff88)":"none",transition:"filter 0.15s"}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",fontFamily:"'Share Tech Mono',monospace"}}>{t.label}</span>
            {active&&<div style={{position:"absolute",bottom:0,width:24,height:2,background:"linear-gradient(90deg,#00ff88,#00ccff)",borderRadius:99,boxShadow:"0 0 8px #00ff88"}}/>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// TOP BAR
// ============================================================
function TopBar({title,subtitle,right}){
  return(
    <div style={{position:"sticky",top:0,background:"rgba(2,4,8,0.96)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",padding:"12px 16px",zIndex:100,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:800,color:"#fff",letterSpacing:1}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{subtitle}</div>}
      </div>
      {right&&<div>{right}</div>}
    </div>
  );
}

// ============================================================
// PAGE: DASHBOARD
// ============================================================
function Dashboard({setPage,showToast}){
  const stats=[
    {icon:"✂️",label:"Clips",value:"2,847",delta:"+12%",color:"#00ff88"},
    {icon:"🔥",label:"Avg Score",value:"91.4",delta:"+3.2",color:"#ffcc00"},
    {icon:"👁",label:"Views",value:"4.8M",delta:"+28%",color:"#00ccff"},
    {icon:"📈",label:"Growth",value:"284%",delta:"this month",color:"#ff3366"},
  ];
  const [coachMsg]=useState("Your TikTok hook strength dropped 12% this week. I found 3 clips ready to go viral — post them tonight at 7PM for max reach. Your consistency score is your #1 growth blocker right now.");
  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="CLIPFORGE" subtitle="AI Video Empire Builder"
        right={<GlowBtn size="sm" onClick={()=>setPage("upload")} icon="🎬">UPLOAD</GlowBtn>}/>
      <div style={{padding:"16px 16px 0"}}>
        {/* Trend Alert Banner */}
        <div style={{background:"linear-gradient(135deg,rgba(255,204,0,0.1),rgba(255,51,102,0.1))",border:"1px solid rgba(255,204,0,0.3)",borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18,animation:"pulse 2s ease-in-out infinite"}}>🔥</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:"#ffcc00",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>TRENDING NOW</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{TRENDING_AUDIO[0].name} · {TRENDING_AUDIO[0].uses} uses · {TRENDING_AUDIO[0].trend} this week</div>
          </div>
          <GlowBtn size="sm" variant="gold" onClick={()=>showToast("🎵 Audio swapped into your top clip!")}>SWAP</GlowBtn>
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {stats.map((s,i)=>(
            <Card key={i} style={{padding:14,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.07}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <Tag color={s.color}>{s.delta}</Tag>
              </div>
              <div style={{fontSize:22,fontWeight:900,fontFamily:"'Orbitron',sans-serif",color:"#fff",letterSpacing:-0.5}}>{s.value}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
            </Card>
          ))}
        </div>
        {/* AI Coach */}
        <Card style={{marginBottom:16,background:"linear-gradient(135deg,rgba(0,255,136,0.04),rgba(0,204,255,0.04))",border:"1px solid rgba(0,255,136,0.15)",animation:"glow 3s ease-in-out infinite"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00ff88,#00ccff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🤖</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>AI GROWTH COACH</div>
              <div style={{fontSize:10,color:"#00ff88",display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:"#00ff88",display:"inline-block",animation:"pulse 2s ease-in-out infinite"}}/>GEMINI KEY 2 · ONLINE</div>
            </div>
          </div>
          <div style={{fontSize:13,color:"rgba(224,240,255,0.75)",lineHeight:1.7,marginBottom:12,borderLeft:"2px solid rgba(0,255,136,0.3)",paddingLeft:10}}>"{coachMsg}"</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {GROWTH_TIPS.slice(0,2).map((t,i)=>(
              <div key={i} style={{padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:10,borderLeft:`3px solid ${t.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <Tag color={t.priority==="CRITICAL"?"#ff3366":t.priority==="HIGH"?"#ffcc00":"#00ccff"}>{t.priority}</Tag>
                  <span style={{fontSize:11,color:"#00ff88",fontWeight:700}}>{t.impact}</span>
                </div>
                <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>{t.platform} · {t.tip}</div>
              </div>
            ))}
          </div>
          <GlowBtn variant="ghost" full size="sm" style={{marginTop:12}} onClick={()=>setPage("growth")}>OPEN GROWTH ENGINE →</GlowBtn>
        </Card>
        {/* Recent clips */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>RECENT CLIPS</div>
            <button onClick={()=>setPage("clips")} style={{fontSize:11,color:"#00ff88",background:"none",border:"none",cursor:"pointer",fontFamily:"'Share Tech Mono',monospace"}}>VIEW ALL →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {MOCK_CLIPS.slice(0,3).map((c,i)=>(
              <Card key={i} style={{padding:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:48,height:48,borderRadius:8,background:"linear-gradient(135deg,#0a2a1a,#051510)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,position:"relative"}}>▶<div style={{position:"absolute",bottom:2,right:2,background:"rgba(0,0,0,0.9)",borderRadius:3,padding:"1px 4px",fontSize:8,fontFamily:"'Share Tech Mono',monospace"}}>{c.duration}</div></div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                    <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>{c.platform} · {c.views}</div>
                  </div>
                  <ProbRing pct={c.score} size={40}/>
                </div>
              </Card>
            ))}
          </div>
        </div>
        {/* Weekly calendar mini */}
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5,marginBottom:12}}>THIS WEEK</div>
          <div style={{display:"flex",gap:6}}>
            {WEEK_PLAN.map((d,i)=>(
              <div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:9,color:"var(--muted)",marginBottom:4,fontFamily:"'Share Tech Mono',monospace"}}>{d.day}</div>
                <div style={{height:40,background:`${d.color}15`,borderRadius:6,border:`1px solid ${d.color}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:12,fontWeight:900,color:d.color,fontFamily:"'Orbitron',sans-serif"}}>{d.posts}</div>
                </div>
                <div style={{fontSize:8,color:"var(--muted)",marginTop:3}}>{d.focus.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: UPLOAD
// ============================================================
function Upload({setPage,showToast}){
  const [phase,setPhase]=useState("idle");
  const [fileName,setFileName]=useState("");
  const [url,setUrl]=useState("");
  const [stage,setStage]=useState(0);
  const [pct,setPct]=useState(0);
  const [drag,setDrag]=useState(false);
  const inputRef=useRef();
  const fileInputRef=useRef();

  const startProcess=(name)=>{
    setFileName(name);setPhase("processing");
    let p=0,s=0;
    const tick=setInterval(()=>{
      p+=1;setPct(p);
      const nextStageAt=Math.round((s+1)/PROCESS_STAGES.length*100);
      if(p>=nextStageAt&&s<PROCESS_STAGES.length-1){s++;setStage(s);}
      if(p>=100){clearInterval(tick);setTimeout(()=>{setPhase("done");showToast("🎉 10 viral clips generated!");},600);}
    },120);
  };

  const handleGallery=()=>fileInputRef.current?.click();

  if(phase==="done") return(
    <div style={{animation:"fadeUp 0.4s ease",textAlign:"center",padding:"60px 24px",paddingBottom:100}}>
      <div style={{fontSize:64,marginBottom:16,animation:"float 3s ease-in-out infinite"}}>🎬</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,fontWeight:900,color:"#fff",marginBottom:8,letterSpacing:2}}>CLIPS READY</div>
      <div style={{color:"var(--muted)",marginBottom:28,fontSize:13}}>{fileName}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:300,margin:"0 auto"}}>
        <GlowBtn full size="lg" onClick={()=>setPage("clips")} icon="✂️">VIEW MY CLIPS</GlowBtn>
        <GlowBtn full variant="ghost" onClick={()=>{setPhase("idle");setPct(0);setStage(0);}}>UPLOAD ANOTHER</GlowBtn>
      </div>
    </div>
  );

  if(phase==="processing") return(
    <div style={{animation:"fadeUp 0.4s ease",padding:"40px 24px",paddingBottom:100}}>
      <TopBar title="PROCESSING" subtitle={fileName}/>
      <div style={{padding:16,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16,animation:"spin 3s linear infinite"}}>⚙️</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#fff",marginBottom:20,letterSpacing:2}}>ANALYZING VIDEO</div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:99,height:6,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00ff88,#00ccff)",borderRadius:99,transition:"width 0.1s linear",boxShadow:"0 0 15px rgba(0,255,136,0.5)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:28,fontSize:12,color:"var(--muted)"}}>
          <span>{PROCESS_STAGES[stage]?.icon} {PROCESS_STAGES[stage]?.label}</span>
          <span style={{color:"#00ff88",fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {PROCESS_STAGES.map((s,i)=>(
            <div key={i} style={{padding:"8px 10px",borderRadius:8,background:i<=stage?"rgba(0,255,136,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${i<=stage?"rgba(0,255,136,0.2)":"rgba(255,255,255,0.04)"}`,fontSize:11,color:i<stage?"#00ff88":i===stage?"#fff":"var(--muted)",transition:"all 0.3s",textAlign:"left",display:"flex",alignItems:"center",gap:6}}>
              <span>{i<stage?"✓":i===stage?"⟳":s.icon}</span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:100}}>
      <TopBar title="UPLOAD" subtitle="Turn any video into viral clips"/>
      <div style={{padding:16}}>
        {/* Drop zone */}
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)startProcess(f.name);}}
          onClick={()=>inputRef.current?.click()}
          style={{border:`2px dashed ${drag?"#00ff88":"rgba(0,255,136,0.2)"}`,borderRadius:16,padding:"40px 24px",textAlign:"center",cursor:"pointer",background:drag?"rgba(0,255,136,0.03)":"transparent",transition:"all 0.3s",marginBottom:12,animation:"glow 3s ease-in-out infinite"}}>
          <input ref={inputRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])startProcess(e.target.files[0].name);}}/>
          <div style={{fontSize:44,marginBottom:12,animation:"float 3s ease-in-out infinite"}}>🎬</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,color:"#fff",marginBottom:6,letterSpacing:1}}>DROP VIDEO HERE</div>
          <div style={{color:"var(--muted)",fontSize:12,marginBottom:16,lineHeight:1.6}}>MP4 · MOV · AVI · MKV up to 10GB</div>
          <GlowBtn icon="⚡">CHOOSE FILE</GlowBtn>
        </div>
        {/* Gallery button */}
        <input ref={fileInputRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])startProcess(e.target.files[0].name);}}/>
        <GlowBtn variant="dark" full icon="📱" style={{marginBottom:12}} onClick={handleGallery}>PICK FROM GALLERY</GlowBtn>
        {/* URL input */}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&url.trim()&&startProcess(url)}
            placeholder="YouTube · TikTok · Loom · Vimeo URL..."
            style={{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",color:"var(--text)",fontSize:13}}/>
          <GlowBtn onClick={()=>url.trim()&&startProcess(url)}>GO</GlowBtn>
        </div>
        {/* Feature grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {icon:"🤖",title:"Multi-Agent AI",desc:"Gemini Alpha + Beta boardroom scoring"},
            {icon:"🎯",title:"HookForge™",desc:"10 AI hooks ranked by viral probability"},
            {icon:"💬",title:"Auto Captions",desc:"99% accuracy · 50+ languages"},
            {icon:"📐",title:"9:16 Reframe",desc:"Face-tracking auto-vertical crop"},
            {icon:"🔮",title:"Viral Predictor",desc:"% chance of 100K+ views"},
            {icon:"🚀",title:"Growth Plan",desc:"7-day AI strategy per clip"},
          ].map((f,i)=>(
            <Card key={i} style={{padding:12,animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.06}s`}}>
              <div style={{fontSize:20,marginBottom:6}}>{f.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:3,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{f.title}</div>
              <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.5}}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: CLIPS
// ============================================================
function Clips({showToast}){
  const [selected,setSelected]=useState(null);
  const [filter,setFilter]=useState("All");
  const filters=["All","TikTok","Instagram","YouTube","Twitter"];
  const clips=filter==="All"?MOCK_CLIPS:MOCK_CLIPS.filter(c=>c.platform===filter);

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="MY CLIPS" subtitle={`${MOCK_CLIPS.length} clips · Sorted by viral score`}
        right={<GlowBtn size="sm" variant="ghost" onClick={()=>showToast("📦 All clips exported!")}>EXPORT ALL</GlowBtn>}/>
      <div style={{padding:"12px 16px 0"}}>
        {/* Filters */}
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 14px",borderRadius:99,border:`1px solid ${filter===f?"#00ff88":"rgba(255,255,255,0.08)"}`,background:filter===f?"rgba(0,255,136,0.1)":"transparent",color:filter===f?"#00ff88":"var(--muted)",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>{f}</button>
          ))}
        </div>
        {/* Clips list */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {clips.map((clip,i)=>(
            <div key={clip.id}>
              <Card style={{padding:14,cursor:"pointer",border:`1px solid ${selected===clip.id?"rgba(0,255,136,0.3)":"var(--border)"}`,transition:"all 0.2s",animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.07}s`}}
                onClick={()=>setSelected(selected===clip.id?null:clip.id)}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  {/* Thumb */}
                  <div style={{width:72,height:72,borderRadius:10,background:"linear-gradient(135deg,#0a2010,#051008)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                    <span style={{fontSize:24,opacity:0.6}}>▶</span>
                    <div style={{position:"absolute",bottom:3,right:3,background:"rgba(0,0,0,0.9)",borderRadius:3,padding:"1px 4px",fontSize:8,fontFamily:"'Share Tech Mono',monospace"}}>{clip.duration}</div>
                    {clip.viral&&<div style={{position:"absolute",top:3,left:3,background:"linear-gradient(135deg,#ff3366,#ff6633)",borderRadius:3,padding:"1px 5px",fontSize:7,fontWeight:800,color:"#fff"}}>🔥VIRAL</div>}
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clip.title}</div>
                    <div style={{fontSize:10,color:"var(--muted)",marginBottom:6,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{clip.transcript.slice(0,50)}..."</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                      {clip.tags.slice(0,2).map(t=><Tag key={t} color="#00ff88">{t}</Tag>)}
                      <Tag color="#00ccff">{clip.platform}</Tag>
                    </div>
                    {/* Platform bars */}
                    <div style={{display:"flex",gap:8}}>
                      {Object.entries(clip.platformScores).slice(0,3).map(([p,s])=>(
                        <div key={p} style={{display:"flex",alignItems:"center",gap:3}}>
                          <span style={{fontSize:8,color:"var(--muted)",fontFamily:"'Share Tech Mono',monospace"}}>{p.slice(0,2)}</span>
                          <div style={{width:20,height:3,borderRadius:99,background:"rgba(255,255,255,0.08)"}}>
                            <div style={{height:"100%",width:`${s}%`,background:s>=90?"#00ff88":s>=80?"#ffcc00":"#ff3366",borderRadius:99}}/>
                          </div>
                          <span style={{fontSize:8,color:s>=90?"#00ff88":s>=80?"#ffcc00":"#ff3366",fontFamily:"'Share Tech Mono',monospace"}}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Score */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                    <ProbRing pct={clip.score} size={44}/>
                    <div style={{fontSize:8,color:"var(--muted)",fontFamily:"'Share Tech Mono',monospace"}}>VIRAL</div>
                  </div>
                </div>
                {/* Action buttons */}
                <div style={{display:"flex",gap:6,marginTop:12}}>
                  <GlowBtn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();showToast(`📅 "${clip.title}" scheduled!`);}} style={{flex:1,justifyContent:"center"}}>SCHEDULE</GlowBtn>
                  <GlowBtn size="sm" variant="dark" onClick={e=>{e.stopPropagation();showToast("⬇ Saving to gallery...");}} icon="📱">SAVE</GlowBtn>
                  <GlowBtn size="sm" variant="dark" onClick={e=>{e.stopPropagation();showToast("⬇ Downloading...");}} icon="⬇">MP4</GlowBtn>
                </div>
              </Card>
              {/* Expanded panel */}
              {selected===clip.id&&(
                <div style={{background:"var(--card2)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:12,padding:14,marginTop:6,animation:"fadeIn 0.25s ease"}}>
                  {/* Radar chart + viral prob */}
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                    <RadarChart scores={clip} size={140}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:8,letterSpacing:0.5}}>CLIPFORGE SCORE™</div>
                      {[["Hook",clip.hookScore],["Retention",clip.retentionScore],["Emotion",clip.emotionalScore],["Platform",clip.platformFit]].map(([l,v])=>(
                        <div key={l} style={{marginBottom:5}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginBottom:2}}>
                            <span>{l}</span><span style={{color:"#00ff88",fontFamily:"'Share Tech Mono',monospace"}}>{v}</span>
                          </div>
                          <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
                            <div style={{height:"100%",width:`${v}%`,background:`linear-gradient(90deg,#00ff88,#00ccff)`,borderRadius:99}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 3 info panels */}
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{padding:10,background:"rgba(0,255,136,0.05)",borderRadius:10,border:"1px solid rgba(0,255,136,0.1)"}}>
                      <div style={{fontSize:10,color:"#00ff88",fontWeight:700,marginBottom:4,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>🎯 HOOK ANALYSIS</div>
                      <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.6}}>Hook score: <strong style={{color:"#fff"}}>{clip.hookScore}/100</strong> · Opens with curiosity gap · <strong style={{color:"#ffcc00"}}>Tip: Add a specific number in first 3 words for +34% retention</strong></div>
                    </div>
                    <div style={{padding:10,background:"rgba(0,204,255,0.05)",borderRadius:10,border:"1px solid rgba(0,204,255,0.1)"}}>
                      <div style={{fontSize:10,color:"#00ccff",fontWeight:700,marginBottom:4,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>📅 BEST POST TIME</div>
                      <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.6}}><strong style={{color:"#fff"}}>{clip.bestDay} · {clip.bestTime}</strong> · Platform: <strong style={{color:"#fff"}}>{clip.bestPlatform||clip.platform}</strong> · <strong style={{color:"#00ccff"}}>Viral probability: {clip.viralProbability}%</strong></div>
                    </div>
                    <div style={{padding:10,background:"rgba(255,51,102,0.05)",borderRadius:10,border:"1px solid rgba(255,51,102,0.1)"}}>
                      <div style={{fontSize:10,color:"#ff3366",fontWeight:700,marginBottom:4,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>🔮 VIRAL PREDICTION</div>
                      <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.6}}><strong style={{color:"#ffcc00"}}>{clip.viralProbability}% chance of 100K+ views</strong> · Based on hook strength, trend alignment, competitor analysis</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: GROWTH ENGINE
// ============================================================
function Growth({showToast}){
  const [tab,setTab]=useState("coach");
  const [chatInput,setChatInput]=useState("");
  const [chatHistory,setChatHistory]=useState([
    {role:"ai",msg:"Hey! I'm your AI Growth Coach powered by Gemini Algorithm Whisperer. I know every platform's algorithm deeply. What's your niche? Let's build your zero-to-viral strategy!"}
  ]);
  const [typing,setTyping]=useState(false);
  const [niche,setNiche]=useState("");
  const chatEndRef=useRef();

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[chatHistory]);

  const sendMsg=()=>{
    if(!chatInput.trim()) return;
    const msg=chatInput; setChatInput("");
    setChatHistory(h=>[...h,{role:"user",msg}]);
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      const replies=[
        `Great question about "${msg.slice(0,25)}...". Your hook quality is your #1 lever right now. Start every video mid-sentence — never with "Hey guys". Your retention will jump 40% instantly.`,
        `Based on your content pattern, TikTok is your fastest path to monetization. Post at 7PM Tuesday and Thursday. Those are your peak windows. 3 posts/day for 30 days = algorithm favor guaranteed.`,
        `The data is clear: your emotional clips outperform value clips by 3.2x. Double down on personal story format. Add: "This happened to me..." as your hook template.`,
        `Competitor analysis shows 3 creators dominating your niche with 15-45 second clips. You're posting 2-3 minutes. Cut everything to 45 seconds max. Watch your completion rate explode.`,
      ];
      setChatHistory(h=>[...h,{role:"ai",msg:replies[Math.floor(Math.random()*replies.length)]}]);
    },1500);
  };

  const tabs=[
    {id:"coach",icon:"🤖",label:"Coach"},
    {id:"viral",icon:"🔮",label:"Predict"},
    {id:"intel",icon:"📡",label:"Intel"},
    {id:"calendar",icon:"📅",label:"Plan"},
    {id:"simulator",icon:"🎮",label:"Sim"},
  ];

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="GROWTH ENGINE" subtitle="Zero to viral · Gemini Algorithm Whisperer"/>
      {/* Sub tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--border)",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:"0 0 auto",padding:"10px 16px",border:"none",borderBottom:`2px solid ${tab===t.id?"#00ff88":"transparent"}`,background:"transparent",color:tab===t.id?"#00ff88":"var(--muted)",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.15s",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:16}}>

        {/* COACH TAB */}
        {tab==="coach"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 280px)"}}>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {chatHistory.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:c.role==="user"?"flex-end":"flex-start",animation:"fadeUp 0.3s ease"}}>
                  <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:c.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:c.role==="user"?"linear-gradient(135deg,#00ff88,#00ccff)":"var(--card2)",color:c.role==="user"?"#000":"var(--text)",fontSize:12,lineHeight:1.6,fontWeight:c.role==="user"?700:400,border:c.role==="ai"?"1px solid var(--border)":"none"}}>
                    {c.msg}
                  </div>
                </div>
              ))}
              {typing&&(
                <div style={{display:"flex",gap:5,padding:"10px 14px",background:"var(--card2)",borderRadius:"14px 14px 14px 4px",width:"fit-content",border:"1px solid var(--border)"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00ff88",animation:`pulse 1s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}/>)}
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}
                placeholder="Ask your AI coach anything..."
                style={{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",color:"var(--text)",fontSize:13}}/>
              <GlowBtn onClick={sendMsg} size="md">SEND</GlowBtn>
            </div>
          </div>
        )}

        {/* VIRAL PREDICTION TAB */}
        {tab==="viral"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card style={{background:"linear-gradient(135deg,rgba(255,51,102,0.08),rgba(255,204,0,0.04))",border:"1px solid rgba(255,51,102,0.2)"}}>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#ff3366",marginBottom:12,letterSpacing:0.5}}>🔮 VIRAL PREDICTION MODEL</div>
              <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.7,marginBottom:14}}>Before you post, ClipForge predicts the probability of hitting 100K+ views based on real-time competitor analysis, trending topic alignment, and hook strength scoring.</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {MOCK_CLIPS.map((c,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"var(--surface)",borderRadius:10}}>
                    <ProbRing pct={c.viralProbability} size={48}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                      <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>
                        {c.viralProbability>=80?<span style={{color:"#00ff88"}}>✅ HIGH CONFIDENCE — Post today</span>:
                         c.viralProbability>=65?<span style={{color:"#ffcc00"}}>⚠️ MODERATE — Improve hook first</span>:
                         <span style={{color:"#ff3366"}}>❌ LOW — Needs rework before posting</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ccff",marginBottom:12,letterSpacing:0.5}}>📊 CONTENT DNA PROFILER</div>
              <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>Paste a competitor handle to reverse-engineer their success formula</div>
              <div style={{display:"flex",gap:8}}>
                <input placeholder="@competitor_handle" style={{flex:1,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px",color:"var(--text)",fontSize:12}}/>
                <GlowBtn variant="ghost" onClick={()=>showToast("🧬 Analyzing competitor DNA...")}>ANALYZE</GlowBtn>
              </div>
            </Card>
          </div>
        )}

        {/* INTEL TAB */}
        {tab==="intel"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Card style={{background:"rgba(0,255,136,0.03)",border:"1px solid rgba(0,255,136,0.15)"}}>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:12,letterSpacing:0.5}}>📡 LIVE ALGORITHM INTEL</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {p:"TikTok",c:"#ff0050",signal:"Completion rate >70% = instant boost TODAY",urgency:"NOW",action:"Keep under 45 seconds"},
                  {p:"Instagram",c:"#e1306c",signal:"Saves = 3x reach multiplier this week",urgency:"HIGH",action:"Add 'save this' CTA"},
                  {p:"YouTube",c:"#ff0000",signal:"CTR >10% triggers suggested feed",urgency:"HIGH",action:"Bold thumbnail + number"},
                  {p:"Facebook",c:"#1877f2",signal:"Video posts getting 5x text reach",urgency:"MEDIUM",action:"Post Reels to FB too"},
                  {p:"LinkedIn",c:"#0077b5",signal:"8AM Tuesday = peak B2B traffic",urgency:"MEDIUM",action:"Schedule professional clips"},
                ].map((a,i)=>(
                  <div key={i} style={{padding:"10px 12px",background:"var(--surface)",borderRadius:10,borderLeft:`3px solid ${a.c}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:700,color:a.c,fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{a.p}</span>
                      <Tag color={a.urgency==="NOW"?"#ff3366":a.urgency==="HIGH"?"#ffcc00":"#00ccff"}>{a.urgency}</Tag>
                    </div>
                    <div style={{fontSize:11,color:"var(--text)",marginBottom:3}}>{a.signal}</div>
                    <div style={{fontSize:10,color:"var(--muted)"}}>{a.action}</div>
                  </div>
                ))}
              </div>
            </Card>
            {/* Trending audio */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#ffcc00",marginBottom:12,letterSpacing:0.5}}>🎵 TRENDING AUDIO</div>
              {TRENDING_AUDIO.map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--surface)",borderRadius:10,marginBottom:8}}>
                  <div style={{fontSize:20}}>🎵</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{a.name}</div>
                    <div style={{fontSize:10,color:"var(--muted)"}}>{a.artist} · {a.uses} uses</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <Tag color="#00ff88">{a.trend}</Tag>
                    <div style={{marginTop:6}}>
                      <GlowBtn size="sm" variant="ghost" onClick={()=>showToast(`🎵 Swapping to "${a.name}"...`)}>SWAP</GlowBtn>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab==="calendar"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:4,letterSpacing:0.5}}>📅 30-DAY ZERO TO VIRAL PLAN</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:14}}>AI-optimized posting schedule across all your platforms</div>
              {/* Week grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:14}}>
                {WEEK_PLAN.map((d,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:9,color:"var(--muted)",marginBottom:4,fontFamily:"'Share Tech Mono',monospace"}}>{d.day}</div>
                    <div style={{padding:"8px 4px",background:`${d.color}12`,borderRadius:8,border:`1px solid ${d.color}25`}}>
                      <div style={{fontSize:14,fontWeight:900,color:d.color,fontFamily:"'Orbitron',sans-serif"}}>{d.posts}</div>
                    </div>
                    <div style={{fontSize:7,color:"var(--muted)",marginTop:3,lineHeight:1.2}}>{d.focus}</div>
                  </div>
                ))}
              </div>
              <GlowBtn full variant="ghost" onClick={()=>showToast("📅 Calendar synced to Scheduler!")}>SYNC TO SCHEDULER</GlowBtn>
            </Card>
            {/* 30-day roadmap */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ccff",marginBottom:14,letterSpacing:0.5}}>🗺️ 30-DAY ROADMAP</div>
              {[
                {week:"WEEK 1",title:"Foundation",desc:"Post 3x/day TikTok. Test 5 different hook styles. Find what gets best completion rate. Consistency > quality right now.",color:"#00ff88"},
                {week:"WEEK 2",title:"Double Down",desc:"Kill underperforming hooks. Double down on top 2 styles. Start Instagram Reels. Engage 30 mins/day in comments.",color:"#00ccff"},
                {week:"WEEK 3",title:"Expand",desc:"Add YouTube Shorts. Target 1 trending topic per day. Cross-post winners across all accounts. Push for 1K TikTok.",color:"#ffcc00"},
                {week:"WEEK 4",title:"Monetize",desc:"Apply for TikTok Creator Fund (1K). Apply for YouTube Partner (1K subs). Instagram Reels Bonus. First income incoming.",color:"#ff3366"},
              ].map((w,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:10,background:"var(--surface)",borderLeft:`3px solid ${w.color}`,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:10,fontFamily:"'Orbitron',sans-serif",color:w.color,letterSpacing:0.5}}>{w.week}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{w.title}</span>
                  </div>
                  <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.6}}>{w.desc}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* SIMULATOR TAB */}
        {tab==="simulator"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card style={{background:"linear-gradient(135deg,rgba(176,109,255,0.08),rgba(0,204,255,0.04))",border:"1px solid rgba(176,109,255,0.25)"}}>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#b06dff",marginBottom:8,letterSpacing:0.5}}>🎮 MILLION-FOLLOWER SIMULATOR</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:14,lineHeight:1.7}}>Test your 30-day strategy in fast-forward. The AI simulates how the algorithm responds to your posting frequency, hook styles, and niche — risk-free.</div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:"var(--text)",marginBottom:6,fontWeight:700}}>Your niche:</div>
                <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. fitness, business, comedy..." style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px",color:"var(--text)",fontSize:12,marginBottom:10}}/>
                <div style={{fontSize:11,color:"var(--text)",marginBottom:6,fontWeight:700}}>Posts per day:</div>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  {[1,2,3,5].map(n=>(
                    <button key={n} style={{flex:1,padding:"8px 4px",borderRadius:8,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:12,fontWeight:700,cursor:"pointer"}}>{n}x</button>
                  ))}
                </div>
              </div>
              <GlowBtn full icon="🎮" onClick={()=>showToast("🎮 Running simulation... Results in 3 seconds!")}>RUN SIMULATION</GlowBtn>
            </Card>
            {/* Simulated results */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:14,letterSpacing:0.5}}>📈 PREDICTED TRAJECTORY</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {period:"Day 7",followers:"0 → 340",views:"12K",color:"#00ff88"},
                  {period:"Day 14",followers:"340 → 1.2K",views:"89K",color:"#00ccff"},
                  {period:"Day 21",followers:"1.2K → 4.8K",views:"380K",color:"#ffcc00"},
                  {period:"Day 30",followers:"4.8K → 18K",views:"1.4M",color:"#ff3366"},
                ].map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"var(--surface)",borderRadius:10}}>
                    <div style={{width:40,textAlign:"center"}}>
                      <div style={{fontSize:10,color:r.color,fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{r.period}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{r.followers} followers</div>
                      <div style={{fontSize:10,color:"var(--muted)"}}>{r.views} total views</div>
                    </div>
                    <div style={{width:60,height:4,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
                      <div style={{height:"100%",width:`${25*(i+1)}%`,background:r.color,borderRadius:99}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,padding:"10px 12px",background:"rgba(0,255,136,0.06)",borderRadius:10,border:"1px solid rgba(0,255,136,0.15)"}}>
                <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.6}}><strong style={{color:"#00ff88"}}>Monetization prediction:</strong> First income by Day 22. TikTok Creator Fund at Day 14 (1K target). YouTube Partner by Day 35.</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: PROFILE / PLATFORMS
// ============================================================
function Profile({showToast}){
  const [tab,setTab]=useState("platforms");
  const [sleepMode,setSleepMode]=useState(false);
  const [batchMode,setBatchMode]=useState(false);

  const tabs=[
    {id:"platforms",icon:"🌐",label:"Platforms"},
    {id:"scheduler",icon:"📅",label:"Schedule"},
    {id:"analytics",icon:"📊",label:"Analytics"},
    {id:"studio",icon:"🎬",label:"Studio"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];

  return(
    <div style={{animation:"fadeUp 0.4s ease",paddingBottom:80}}>
      <TopBar title="COMMAND CENTER" subtitle="Platforms · Analytics · Studio"/>
      {/* Sub tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--border)",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:"0 0 auto",padding:"10px 14px",border:"none",borderBottom:`2px solid ${tab===t.id?"#00ff88":"transparent"}`,background:"transparent",color:tab===t.id?"#00ff88":"var(--muted)",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,transition:"all 0.15s",whiteSpace:"nowrap",fontFamily:"'Share Tech Mono',monospace"}}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:16}}>

        {/* PLATFORMS TAB */}
        {tab==="platforms"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{padding:"10px 14px",background:"rgba(0,255,136,0.06)",borderRadius:10,border:"1px solid rgba(0,255,136,0.15)",fontSize:11,color:"var(--muted)",lineHeight:1.7}}>
              <strong style={{color:"#00ff88"}}>Connect your accounts</strong> — ClipForge will schedule and post optimally. No passwords stored — uses official OAuth only.
            </div>
            {PLATFORMS_CONFIG.map((plat,pi)=>(
              <Card key={pi} style={{padding:14,borderTop:`2px solid ${plat.color}20`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${plat.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{plat.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.3}}>{plat.name}</div>
                    <div style={{fontSize:10,color:"var(--muted)"}}>{plat.accounts.length} accounts · Max {plat.maxPerDay}/day each</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {plat.accounts.map((acc,ai)=>(
                    <div key={ai} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"var(--surface)",borderRadius:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"var(--muted)",flexShrink:0}}/>
                      <span style={{flex:1,fontSize:11,color:"var(--muted)"}}>{acc}</span>
                      <GlowBtn size="sm" variant="ghost" onClick={()=>showToast(`🔗 Connecting ${acc}...`)}>CONNECT</GlowBtn>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* SCHEDULER TAB */}
        {tab==="scheduler"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Sleep Mode */}
            <Card style={{background:sleepMode?"rgba(0,255,136,0.06)":"var(--card)",border:`1px solid ${sleepMode?"rgba(0,255,136,0.3)":"var(--border)"}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:sleepMode?10:0}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>😴 SLEEP MODE</div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>Auto-posts while you sleep · AI finds trending topics</div>
                </div>
                <button onClick={()=>{setSleepMode(!sleepMode);showToast(sleepMode?"😴 Sleep mode OFF":"😴 Sleep mode ON — posting tonight!");}} style={{width:44,height:24,borderRadius:12,background:sleepMode?"#00ff88":"rgba(255,255,255,0.1)",border:"none",cursor:"pointer",transition:"all 0.3s",position:"relative"}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:sleepMode?"#000":"rgba(255,255,255,0.5)",position:"absolute",top:3,left:sleepMode?23:3,transition:"left 0.3s"}}/>
                </button>
              </div>
              {sleepMode&&<div style={{fontSize:11,color:"#00ff88",lineHeight:1.6}}>✅ Active · ClipForge will auto-post your top clips at 7PM tonight across all connected accounts · NewsAPI scanning for trending topics in your niche</div>}
            </Card>
            {/* Batch processing */}
            <Card>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"'Orbitron',sans-serif",letterSpacing:0.5}}>⚡ BATCH PROCESSING</div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>Upload 10 videos · Process overnight</div>
                </div>
                <GlowBtn size="sm" variant="ghost" onClick={()=>showToast("⚡ Batch queue opened!")}>QUEUE</GlowBtn>
              </div>
              {[1,2,3].map(i=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--surface)",borderRadius:8,marginBottom:6}}>
                  <div style={{fontSize:14}}>🎬</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"var(--muted)"}}>Slot {i} — Empty</div>
                  </div>
                  <GlowBtn size="sm" variant="dark" onClick={()=>showToast(`📁 Slot ${i} ready for upload!`)}>+ ADD</GlowBtn>
                </div>
              ))}
            </Card>
            {/* Scheduled posts */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:12,letterSpacing:0.5}}>📋 QUEUE</div>
              {MOCK_CLIPS.slice(0,3).map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--surface)",borderRadius:10,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:i===0?"#00ff88":"#ffcc00",animation:i===0?"pulse 2s ease-in-out infinite":"none",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                    <div style={{fontSize:10,color:"var(--muted)"}}>{c.platform} · {c.bestDay} {c.bestTime}</div>
                  </div>
                  <Tag color={i===0?"#00ff88":"#ffcc00"}>{i===0?"LIVE":"SCHED"}</Tag>
                </div>
              ))}
              <GlowBtn full variant="ghost" size="sm" onClick={()=>showToast("🤖 AI scheduled all clips optimally!")}>🤖 AI AUTO-SCHEDULE ALL</GlowBtn>
            </Card>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab==="analytics"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card style={{background:"rgba(0,255,136,0.03)",border:"1px solid rgba(0,255,136,0.15)"}}>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:12,letterSpacing:0.5}}>📊 UNIFIED DASHBOARD</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[
                  {l:"Total Views",v:"4.8M",c:"#00ff88"},{l:"Followers",v:"+12.4K",c:"#00ccff"},
                  {l:"Engagement",v:"8.7%",c:"#ffcc00"},{l:"Watch Time",v:"340h",c:"#ff3366"},
                ].map((s,i)=>(
                  <div key={i} style={{padding:12,background:"var(--surface)",borderRadius:10,textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:900,color:s.c,fontFamily:"'Orbitron',sans-serif"}}>{s.v}</div>
                    <div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {PLATFORMS_CONFIG.slice(0,4).map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--surface)",borderRadius:8}}>
                    <span style={{fontSize:16}}>{p.icon}</span>
                    <span style={{flex:1,fontSize:11,color:"var(--text)"}}>{p.name}</span>
                    <div style={{width:60,height:3,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
                      <div style={{height:"100%",width:`${[78,65,88,45][i]}%`,background:p.color,borderRadius:99}}/>
                    </div>
                    <span style={{fontSize:10,fontFamily:"'Share Tech Mono',monospace",color:p.color,minWidth:30,textAlign:"right"}}>{["78%","65%","88%","45%"][i]}</span>
                  </div>
                ))}
              </div>
            </Card>
            {/* Monetization tracker */}
            <Card style={{background:"linear-gradient(135deg,rgba(255,204,0,0.06),rgba(255,51,102,0.03))",border:"1px solid rgba(255,204,0,0.2)"}}>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#ffcc00",marginBottom:12,letterSpacing:0.5}}>💰 MONETIZATION TRACKER</div>
              {[
                {p:"TikTok",target:"1K followers",current:340,max:1000,color:"#ff0050",status:"IN PROGRESS"},
                {p:"YouTube",target:"1K subs + 4K hrs",current:89,max:1000,color:"#ff0000",status:"EARLY"},
                {p:"Instagram",target:"Reels Bonus",current:520,max:1000,color:"#e1306c",status:"IN PROGRESS"},
                {p:"Facebook",target:"10K followers",current:1200,max:10000,color:"#1877f2",status:"EARLY"},
              ].map((m,i)=>(
                <div key={i} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:m.color}}>{m.p}</span>
                    <Tag color={m.status==="IN PROGRESS"?"#ffcc00":"#00ccff"}>{m.status}</Tag>
                  </div>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:4}}>{m.target} · {m.current.toLocaleString()} / {m.max.toLocaleString()}</div>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
                    <div style={{height:"100%",width:`${Math.min(100,(m.current/m.max)*100)}%`,background:m.color,borderRadius:99,transition:"width 1s ease"}}/>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* STUDIO TAB */}
        {tab==="studio"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Mobile preview */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ccff",marginBottom:12,letterSpacing:0.5}}>📱 MOBILE PREVIEW SIMULATOR</div>
              <div style={{display:"flex",justifyContent:"center"}}>
                <div style={{width:180,aspectRatio:"9/16",borderRadius:24,border:"6px solid #1a2535",background:"linear-gradient(135deg,#0a2010,#051008)",display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:12,position:"relative",overflow:"hidden",maxHeight:320}}>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,opacity:0.3}}>▶</div>
                  <div style={{position:"absolute",top:10,right:10,display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
                    {["❤️","💬","↗️","🎵"].map((ic,i)=>(
                      <div key={i} style={{textAlign:"center"}}>
                        <div style={{fontSize:20}}>{ic}</div>
                        <div style={{fontSize:8,color:"#fff",fontWeight:700}}>{["3.2M","48K","12K",""][i]}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"linear-gradient(0deg,rgba(0,0,0,0.8),transparent)",padding:"8px 0 4px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2}}>@clipforge_demo</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.8)",lineHeight:1.4}}>The ONE habit that changed my life 🔥 #viral #trending #fyp</div>
                    <div style={{display:"flex",gap:4,marginTop:4}}>
                      {["#viral","#fyp","#trending"].map(h=>(
                        <span key={h} style={{fontSize:8,color:"#00ccff"}}>{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {/* Viral Clone Mode */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#ff3366",marginBottom:8,letterSpacing:0.5}}>🧬 VIRAL CLONE MODE</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Paste any viral TikTok URL — AI reverse-engineers its editing structure</div>
              <div style={{display:"flex",gap:8}}>
                <input placeholder="https://tiktok.com/@user/video/..." style={{flex:1,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px",color:"var(--text)",fontSize:11}}/>
                <GlowBtn variant="red" onClick={()=>showToast("🧬 Analyzing viral structure...")}>CLONE</GlowBtn>
              </div>
            </Card>
            {/* Podcast to blog */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#ffcc00",marginBottom:8,letterSpacing:0.5}}>📝 PODCAST TO BLOG</div>
              <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Generate a 1000+ word SEO blog post from any video transcript</div>
              <GlowBtn full variant="gold" icon="📝" onClick={()=>showToast("📝 Generating SEO blog post...")}>GENERATE BLOG POST</GlowBtn>
            </Card>
            {/* Brand kit */}
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#b06dff",marginBottom:12,letterSpacing:0.5}}>🎨 BRAND KIT</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <GlowBtn full variant="dark" icon="🖼️" onClick={()=>showToast("🖼️ Logo upload coming soon!")}>UPLOAD LOGO</GlowBtn>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"var(--muted)",flex:1}}>Brand Color</span>
                  <div style={{display:"flex",gap:6}}>
                    {["#00ff88","#00ccff","#ff3366","#ffcc00","#b06dff","#ff6633"].map(c=>(
                      <div key={c} onClick={()=>showToast(`🎨 Brand color set to ${c}`)} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",transition:"transform 0.15s",border:"2px solid transparent"}}
                        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
                        onMouseLeave={e=>e.currentTarget.style.transform=""}/>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab==="settings"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#fff",marginBottom:14,letterSpacing:0.5}}>👤 PROFILE</div>
              {[{l:"Display Name",v:"You"},{l:"Email",v:"you@email.com"},{l:"Niche",v:"Business & Growth"},{l:"Timezone",v:"UTC+3 (Nairobi)"}].map((f,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{f.label}</div>
                  <input defaultValue={f.v} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",color:"var(--text)",fontSize:12}}/>
                </div>
              ))}
              <GlowBtn full onClick={()=>showToast("✅ Profile saved!")}>SAVE PROFILE</GlowBtn>
            </Card>
            <Card>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:14,letterSpacing:0.5}}>🔑 API KEYS</div>
              {[
                {l:"Gemini Key 1 (Alpha — Viral Scorer)",ph:"AIza..."},
                {l:"Gemini Key 2 (Beta — Algorithm Whisperer)",ph:"AIza..."},
                {l:"HuggingFace Token",ph:"hf_..."},
                {l:"Pyannote Token",ph:"hf_..."},
              ].map((f,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{f.l}</div>
                  <input type="password" placeholder={f.ph} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",color:"var(--text)",fontSize:12,fontFamily:"'Share Tech Mono',monospace"}}/>
                </div>
              ))}
              <GlowBtn full onClick={()=>showToast("🔑 Keys saved securely!")}>SAVE KEYS</GlowBtn>
            </Card>
            {/* System status */}
            <Card style={{background:"rgba(0,255,136,0.03)",border:"1px solid rgba(0,255,136,0.15)"}}>
              <div style={{fontSize:13,fontFamily:"'Orbitron',sans-serif",color:"#00ff88",marginBottom:12,letterSpacing:0.5}}>⚡ SYSTEM STATUS</div>
              {[
                {l:"HF Spaces Backend",s:"Online"},
                {l:"WhisperX Engine",s:"Ready"},
                {l:"Gemini AI Alpha",s:"Connected"},
                {l:"Gemini AI Beta",s:"Connected"},
                {l:"Cloudflare R2",s:"Connected"},
                {l:"Supabase DB",s:"Online"},
                {l:"Sleep Mode",s:"Standby"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"var(--surface)",borderRadius:8,marginBottom:5}}>
                  <span style={{fontSize:11,color:"var(--muted)"}}>{s.l}</span>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#00ff88",animation:"pulse 2s ease-in-out infinite"}}/>
                    <span style={{fontSize:10,color:"#00ff88",fontFamily:"'Share Tech Mono',monospace",fontWeight:700}}>{s.s}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App(){
  const [authed,setAuthed]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [toast,setToast]=useState(null);

  const showToast=(msg)=>setToast(msg);
  const clearToast=()=>setToast(null);

  const pages={
    dashboard:<Dashboard setPage={setPage} showToast={showToast}/>,
    upload:<Upload setPage={setPage} showToast={showToast}/>,
    clips:<Clips showToast={showToast}/>,
    growth:<Growth showToast={showToast}/>,
    profile:<Profile showToast={showToast}/>,
  };

  if(!authed) return(
    <>
      <style>{GLOBAL_CSS}</style>
      <AuthPage onAuth={()=>setAuthed(true)}/>
    </>
  );

  return(
    <>
      <style>{GLOBAL_CSS}</style>
      {toast&&<Toast msg={toast} onClose={clearToast}/>}
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        {pages[page]}
        <BottomNav page={page} setPage={setPage}/>
      </div>
    </>
  );
}
