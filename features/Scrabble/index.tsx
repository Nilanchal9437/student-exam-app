import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get("window");
const BS = 15;
const CELL = Math.floor((SW - 20) / BS); // ~23px per cell
const RTILE = 46;

const LV: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type SqT = "N" | "DL" | "TL" | "DW" | "TW" | "ST";
interface BoardCell { letter: string | null; locked: boolean; sq: SqT }
interface RTile { id: string; letter: string }

// ─── Premium Board ────────────────────────────────────────────────────────────
function buildPrem(): SqT[][] {
  const B: SqT[][] = Array.from({ length: 15 }, () =>
    Array(15).fill("N") as SqT[]
  );
  const s = (ps: number[][], t: SqT) => ps.forEach(([r, c]) => { B[r][c] = t; });
  s([[0,0],[0,7],[0,14],[7,0],[7,14],[14,0],[14,7],[14,14]], "TW");
  s([[1,1],[2,2],[3,3],[4,4],[10,10],[11,11],[12,12],[13,13],
     [1,13],[2,12],[3,11],[4,10],[10,4],[11,3],[12,2],[13,1]], "DW");
  s([[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],
     [9,1],[9,5],[9,9],[9,13],[13,5],[13,9]], "TL");
  s([[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],
     [6,2],[6,6],[6,8],[6,12],[7,3],[7,11],
     [8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],
     [12,6],[12,8],[14,3],[14,11]], "DL");
  B[7][7] = "ST";
  return B;
}
const PREM = buildPrem();

const SQ: Record<SqT, { bg: string; fg: string; label: string }> = {
  N:  { bg: "#E8E4C8", fg: "transparent", label: "" },
  DL: { bg: "#A8C4E0", fg: "#1a4a7a",     label: "DL" },
  TL: { bg: "#4A90D9", fg: "#fff",         label: "TL" },
  DW: { bg: "#F4C2A0", fg: "#7B2500",      label: "DW" },
  TW: { bg: "#E85C50", fg: "#fff",         label: "TW" },
  ST: { bg: "#F4C2A0", fg: "#7B2500",      label: "★" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuf<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const FREQ: Record<string, number> = {
  A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,
  N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1,
};
function mkBag(): string[] {
  const b: string[] = [];
  Object.entries(FREQ).forEach(([l, n]) => { for (let i = 0; i < n; i++) b.push(l); });
  return shuf(b);
}

// ─── Initial Board (EDUCATION pre-placed) ─────────────────────────────────────
const WORD = "EDUCATION", WR = 7, WC = 3;
function initBoard(): BoardCell[][] {
  return Array.from({ length: 15 }, (_, r) =>
    Array.from({ length: 15 }, (_, c) => ({
      letter: r === WR && c >= WC && c < WC + WORD.length ? WORD[c - WC] : null,
      locked: r === WR && c >= WC && c < WC + WORD.length,
      sq: PREM[r][c],
    }))
  );
}

// ─── Valid Words ──────────────────────────────────────────────────────────────
const VALID = new Set([
  "EDUCATION","CAT","DOG","AND","BIG","FOR","HIT","JOY","PUT","ARE","SAT",
  "SIT","TAP","TIP","ATE","USE","RUN","WIN","ACE","BAT","BET","BIT","BUT",
  "CAR","FAN","GAS","HAT","HOP","ICE","JET","LAD","MAP","NAP","PAD","RAG",
  "SAP","TAB","LOTS","SLOT","PAIL","LIPS","SOIL","TOIL","PITS","SPIT",
  "OILS","TOPS","SPOT","STOP","POTS","OPTS","POST","VITA","VOLT","VIOL",
  "PIVOT","PILOT","VIOLA","VITAL","SPLIT","SLIP","LOPS","SPOIL","VIPS",
  "PINS","SPIN","TIPS","OIL","TOP","LIP","SIP","PIT","LOT","POI","VIP",
]);

// ─── CPU Planned Moves ────────────────────────────────────────────────────────
const CPU_MOVES: [string, number, number, boolean][] = [
  ["CAT", 5, 7, false],
  ["ACE", 7, 12, false],
  ["RUN", 9, 5, true],
  ["HAT", 10, 7, false],
  ["BIT", 4, 4, true],
];

// ─── BoardCell Component ──────────────────────────────────────────────────────
const BoardCellComp = React.memo(function BoardCellComp({
  cell, pending, targetable, onPress,
}: {
  cell: BoardCell; pending: boolean; targetable: boolean; onPress: () => void;
}) {
  const q = SQ[cell.sq];
  const hasTile = cell.letter !== null;
  const bg = hasTile
    ? pending ? "#FAFAD2" : "#F5E88A"
    : targetable ? "#D6EAFF" : q.bg;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        width: CELL, height: CELL, backgroundColor: bg,
        borderWidth: pending ? 1.5 : 0.5,
        borderColor: pending ? "#2452FF" : hasTile ? "#C8A028" : "rgba(0,0,0,0.09)",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {hasTile ? (
        <>
          <Text style={{ fontSize: CELL * 0.52, fontWeight: "800", color: "#1A1A1A", lineHeight: CELL * 0.58 }}>
            {cell.letter}
          </Text>
          <Text style={{ position: "absolute", bottom: 1, right: 2, fontSize: CELL * 0.27, fontWeight: "700", color: "#665500" }}>
            {LV[cell.letter!] ?? 1}
          </Text>
        </>
      ) : q.label ? (
        <Text style={{ fontSize: CELL * 0.27, fontWeight: "700", color: q.fg, textAlign: "center" }}>
          {q.label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
});

// ─── Rack Tile Component ──────────────────────────────────────────────────────
function RackTileComp({ tile, selected, onPress }: { tile: RTile; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: RTILE, height: RTILE,
        backgroundColor: selected ? "#FAFAD2" : "#F5E88A",
        borderRadius: 8, borderWidth: selected ? 2 : 1.5,
        borderColor: selected ? "#2452FF" : "#C8A028",
        alignItems: "center", justifyContent: "center",
        marginHorizontal: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: selected ? 4 : 2 },
        shadowOpacity: selected ? 0.2 : 0.12,
        shadowRadius: selected ? 8 : 4,
        elevation: selected ? 8 : 3,
        transform: [{ translateY: selected ? -5 : 0 }],
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}>{tile.letter}</Text>
      <Text style={{ position: "absolute", bottom: 3, right: 5, fontSize: 9, fontWeight: "700", color: "#665500" }}>
        {LV[tile.letter] ?? 1}
      </Text>
    </TouchableOpacity>
  );
}

// ─── VIP Status Bar ───────────────────────────────────────────────────────────
function VIPBar() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 16 / 30, duration: 900, useNativeDriver: false }).start();
  }, []);
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-brand-blue">VIP Subscription Status</Text>
        <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
          <Text className="text-brand-blue text-[11px] font-bold tracking-wider">ACTIVE</Text>
        </View>
      </View>
      <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
        <Animated.View style={{ width: w }} className="h-full bg-brand-blue rounded-full" />
      </View>
      <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        Premium Academic License: Renews in 14 days
      </Text>
    </View>
  );
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards({ secs, you, cpu, level }: { secs: number; you: number; cpu: number; level: number }) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const urgent = secs < 60;

  return (
    <View className="flex-row mx-4 mt-3 gap-3">
      <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-3 py-3"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
        <View className="flex-row items-center gap-1 mb-1">
          <Ionicons name="time-outline" size={11} color={urgent ? "#EF4444" : "#9CA3AF"} />
          <Text className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Time Remaining
          </Text>
        </View>
        <View className="flex-row items-baseline gap-0.5">
          <Text className={`text-2xl font-extrabold ${urgent ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
            {m}
          </Text>
          <Text className={`text-sm font-semibold mr-1 ${urgent ? "text-red-400" : "text-gray-400"}`}>m</Text>
          <Text className={`text-2xl font-extrabold ${urgent ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
            {String(s).padStart(2, "0")}
          </Text>
          <Text className={`text-sm font-semibold ${urgent ? "text-red-400" : "text-gray-400"}`}>s</Text>
        </View>
      </View>

      <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-3 py-3"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
        <View className="flex-row items-center gap-1 mb-1">
          <Ionicons name="person-outline" size={11} color="#9CA3AF" />
          <Text className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            VS AI Level {level}
          </Text>
        </View>
        <View className="flex-row items-center justify-around">
          <View className="items-center">
            <Text className="text-[10px] text-gray-400 font-medium">You</Text>
            <Text className="text-2xl font-extrabold text-brand-blue">{you}</Text>
          </View>
          <Text className="text-gray-200 dark:text-gray-600 text-xl font-light">|</Text>
          <View className="items-center">
            <Text className="text-[10px] text-gray-400 font-medium">CPU</Text>
            <Text className="text-2xl font-extrabold text-gray-700 dark:text-gray-300">{cpu}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Prize Banner ─────────────────────────────────────────────────────────────
function PrizeBanner() {
  return (
    <View className="mx-4 mt-4 mb-2 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden flex-row"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
      <View className="flex-1 px-4 py-4">
        <Text className="text-base font-extrabold text-gray-900 dark:text-white mb-1">Win a Tablet!</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 leading-4 mb-3">
          Top scorer this week wins a new iPad Air with Apple Pencil.
        </Text>
        <TouchableOpacity activeOpacity={0.8}
          className="self-start flex-row items-center gap-1.5 border border-brand-blue rounded-xl px-3 py-1.5">
          <Text className="text-brand-blue text-xs font-bold">View Leaderboard</Text>
          <MaterialCommunityIcons name="chart-bar" size={13} color="#2452FF" />
        </TouchableOpacity>
      </View>
      <View className="w-[120px] bg-teal-700 justify-center items-center relative">
        <View className="absolute top-0 right-0 bg-orange-500 px-2 py-0.5 rounded-bl-lg">
          <Text className="text-white text-[9px] font-extrabold uppercase tracking-wider">Grand Prize</Text>
        </View>
        <MaterialCommunityIcons name="tablet" size={52} color="white" />
        <Text className="text-white/70 text-[9px] font-medium mt-1">iPad Air</Text>
      </View>
    </View>
  );
}

// ─── Score Word ───────────────────────────────────────────────────────────────
function scoreWord(board: BoardCell[][], cells: { r: number; c: number }[]): number {
  if (cells.length === 0) return 0;
  let wordMult = 1;
  let total = 0;
  const isHoriz = cells[0].r === cells[cells.length - 1].r;
  const allCells = new Set(cells.map(({ r, c }) => `${r},${c}`));

  // Determine full word span
  let [minR, minC, maxR, maxC] = [cells[0].r, cells[0].c, cells[0].r, cells[0].c];
  cells.forEach(({ r, c }) => { minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); });

  const span = isHoriz
    ? Array.from({ length: maxC - minC + 1 }, (_, i) => ({ r: minR, c: minC + i }))
    : Array.from({ length: maxR - minR + 1 }, (_, i) => ({ r: minR + i, c: minC }));

  span.forEach(({ r, c }) => {
    const cell = board[r][c];
    if (!cell.letter) return;
    const lv = LV[cell.letter] ?? 1;
    const isNew = allCells.has(`${r},${c}`);
    if (isNew && !cell.locked) {
      if (cell.sq === "DL") total += lv * 2;
      else if (cell.sq === "TL") total += lv * 3;
      else total += lv;
      if (cell.sq === "DW" || cell.sq === "ST") wordMult *= 2;
      if (cell.sq === "TW") wordMult *= 3;
    } else {
      total += lv;
    }
  });
  return total * wordMult;
}

// ─── Extract Word From Span ───────────────────────────────────────────────────
function extractWord(board: BoardCell[][], cells: { r: number; c: number }[]): string {
  if (!cells.length) return "";
  const isHoriz = cells.every(c => c.r === cells[0].r);
  const sorted = [...cells].sort((a, b) => isHoriz ? a.c - b.c : a.r - b.r);
  const [minR, minC] = [sorted[0].r, sorted[0].c];
  const [maxR, maxC] = [sorted[sorted.length - 1].r, sorted[sorted.length - 1].c];
  const span = isHoriz
    ? Array.from({ length: maxC - minC + 1 }, (_, i) => board[minR][minC + i])
    : Array.from({ length: maxR - minR + 1 }, (_, i) => board[minR + i][minC]);
  return span.map(c => c.letter ?? "").join("");
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ScrabbleScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const [board, setBoard] = useState<BoardCell[][]>(initBoard);
  const [rack, setRack] = useState<RTile[]>(
    ["V", "I", "P", "S", "L", "O", "T"].map((l, i) => ({ id: `r${i}`, letter: l }))
  );
  const [bag, setBag] = useState<string[]>(mkBag);
  const [selId, setSelId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ r: number; c: number }[]>([]);
  const [you, setYou] = useState(124);
  const [cpu, setCpu] = useState(108);
  const [secs, setSecs] = useState(18 * 60 + 42);
  const [cpuIdx, setCpuIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  let uidRef = useRef(100);
  const uid = () => `t${++uidRef.current}`;

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(t); setGameOver(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameOver]);

  // ── Draw tiles from bag ────────────────────────────────────────────────────
  const drawTiles = useCallback((needed: number, currentBag: string[]): [RTile[], string[]] => {
    const newBag = [...currentBag];
    const drawn: RTile[] = [];
    for (let i = 0; i < needed && newBag.length > 0; i++) {
      drawn.push({ id: uid(), letter: newBag.pop()! });
    }
    return [drawn, newBag];
  }, []);

  // ── Cell Press ─────────────────────────────────────────────────────────────
  const handleCellPress = useCallback((r: number, c: number) => {
    const cell = board[r][c];
    // If cell has a pending (this-turn) tile, recall it
    const isPending = pending.some(p => p.r === r && p.c === c);
    if (isPending) {
      const recalled = cell.letter!;
      setBoard(prev => {
        const nb = prev.map(row => row.map(cel => ({ ...cel })));
        nb[r][c] = { ...nb[r][c], letter: null, locked: false };
        return nb;
      });
      setPending(prev => prev.filter(p => !(p.r === r && p.c === c)));
      setRack(prev => [...prev, { id: uid(), letter: recalled }]);
      return;
    }
    // Place selected rack tile
    if (!selId || cell.letter !== null) return;
    const tile = rack.find(t => t.id === selId);
    if (!tile) return;

    // Check direction consistency
    if (pending.length > 0) {
      const isHoriz = pending.every(p => p.r === r);
      const isVert = pending.every(p => p.c === c);
      if (!isHoriz && !isVert) { Alert.alert("Invalid", "Place tiles in a straight line."); return; }
    }

    setBoard(prev => {
      const nb = prev.map(row => row.map(cel => ({ ...cel })));
      nb[r][c] = { ...nb[r][c], letter: tile.letter };
      return nb;
    });
    setPending(prev => [...prev, { r, c }]);
    setRack(prev => prev.filter(t => t.id !== selId));
    setSelId(null);
  }, [board, selId, rack, pending]);

  // ── Play Move ──────────────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    if (pending.length === 0) { Alert.alert("No tiles placed", "Place at least one tile."); return; }

    const word = extractWord(board, pending);
    const isValid = VALID.has(word.toUpperCase());
    const pts = scoreWord(board, pending);

    // Lock all pending tiles
    setBoard(prev => {
      const nb = prev.map(row => row.map(cel => ({ ...cel })));
      pending.forEach(({ r, c }) => { nb[r][c] = { ...nb[r][c], locked: true }; });
      return nb;
    });

    setYou(y => y + pts);
    setPending([]);
    setSelId(null);

    // Draw new tiles
    const [drawn, newBag] = drawTiles(pending.length, bag);
    setRack(prev => [...prev, ...drawn]);
    setBag(newBag);

    // Show result
    Alert.alert(
      isValid ? `✅ "${word}" — +${pts} pts!` : `⚠️ "${word}" — +${pts} pts`,
      isValid ? "Valid word! Great move." : "Word not in dictionary but scored anyway.",
      [{ text: "OK", onPress: () => cpuTurn() }]
    );
  }, [pending, board, bag, drawTiles]);

  // ── CPU Turn ───────────────────────────────────────────────────────────────
  const cpuTurn = useCallback(() => {
    if (cpuIdx >= CPU_MOVES.length) { setCpu(c => c + Math.floor(Math.random() * 8) + 3); return; }
    const [word, row, col, horiz] = CPU_MOVES[cpuIdx];
    setBoard(prev => {
      const nb = prev.map(r => r.map(cel => ({ ...cel })));
      for (let i = 0; i < word.length; i++) {
        const r = horiz ? row : row + i;
        const c = horiz ? col + i : col;
        if (r < 15 && c < 15 && !nb[r][c].locked) {
          nb[r][c] = { letter: word[i], locked: true, sq: nb[r][c].sq };
        }
      }
      return nb;
    });
    const cpuPts = word.split("").reduce((s, l) => s + (LV[l] ?? 1), 0) + 5;
    setCpu(c => c + cpuPts);
    setCpuIdx(i => i + 1);
  }, [cpuIdx]);

  // ── Shuffle ────────────────────────────────────────────────────────────────
  const handleShuffle = () => {
    if (pending.length > 0) { Alert.alert("Recall tiles first"); return; }
    setRack(r => shuf(r));
  };

  // ── Hint ──────────────────────────────────────────────────────────────────
  const handleHint = () => {
    const letters = rack.map(t => t.letter).join(", ");
    Alert.alert("💡 Hint", `Your tiles: ${letters}\n\nTry forming words like: TIPS, OILS, SLOT, SPOT, STOP`);
  };

  // ── Recall All ────────────────────────────────────────────────────────────
  const handleRecall = () => {
    const recalled: RTile[] = [];
    setBoard(prev => {
      const nb = prev.map(r => r.map(c => ({ ...c })));
      pending.forEach(({ r, c }) => {
        if (nb[r][c].letter) recalled.push({ id: uid(), letter: nb[r][c].letter! });
        nb[r][c] = { ...nb[r][c], letter: null };
      });
      return nb;
    });
    setRack(prev => [...prev, ...recalled]);
    setPending([]);
    setSelId(null);
  };

  const pendingSet = useMemo(() => new Set(pending.map(p => `${p.r},${p.c}`)), [pending]);
  const selectedTile = rack.find(t => t.id === selId);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}>
        <TouchableOpacity onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
          <Ionicons name="arrow-back" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-base font-extrabold text-gray-900 dark:text-white">VIP Scrabble Pro</Text>
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name="shield-star" size={11} color="#2452FF" />
            <Text className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Exclusive Access</Text>
          </View>
        </View>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-yellow-50 items-center justify-center"
          style={{ borderWidth: 1, borderColor: "#FDE68A" }}>
          <MaterialCommunityIcons name="trophy" size={20} color="#D97706" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ── VIP Bar ── */}
        <VIPBar />

        {/* ── Stats ── */}
        <StatCards secs={secs} you={you} cpu={cpu} level={4} />

        {/* ── Board ── */}
        <View className="mx-[10px] mt-3 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#D5DCE8",
            shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
            padding: 0,
          }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {board.map((row, r) => (
                <View key={r} style={{ flexDirection: "row" }}>
                  {row.map((cell, c) => (
                    <BoardCellComp
                      key={c}
                      cell={cell}
                      pending={pendingSet.has(`${r},${c}`)}
                      targetable={!!selectedTile && !cell.letter}
                      onPress={() => handleCellPress(r, c)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Rack ── */}
        <View className="mt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, alignItems: "center" }}>
            {rack.map(tile => (
              <RackTileComp
                key={tile.id}
                tile={tile}
                selected={tile.id === selId}
                onPress={() => setSelId(prev => prev === tile.id ? null : tile.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Actions ── */}
        <View className="flex-row mx-4 mt-2 gap-3 items-center">
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handlePlay}
            className="flex-1 bg-brand-blue rounded-2xl py-4 items-center justify-center"
            style={{ shadowColor: "#2452FF", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }}>
            <Text className="text-white font-extrabold text-base tracking-widest uppercase">Play Move</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShuffle}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}>
            <Ionicons name="refresh" size={20} color={isDark ? "#9CA3AF" : "#374151"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHint}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}>
            <Ionicons name="bulb-outline" size={20} color={isDark ? "#9CA3AF" : "#374151"} />
          </TouchableOpacity>
        </View>

        {/* Recall button */}
        {pending.length > 0 && (
          <TouchableOpacity onPress={handleRecall}
            className="mx-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-xl py-2.5 items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold">↩ Recall Tiles</Text>
          </TouchableOpacity>
        )}

        {/* ── Game Over Banner ── */}
        {gameOver && (
          <View className="mx-4 mt-3 bg-red-500 rounded-2xl px-5 py-4 items-center">
            <Text className="text-white text-lg font-extrabold">Time's Up!</Text>
            <Text className="text-white/80 text-sm mt-1">
              {you > cpu ? `You won! 🎉 ${you} – ${cpu}` : `CPU wins. ${you} – ${cpu}`}
            </Text>
            <TouchableOpacity onPress={() => {
              setBoard(initBoard()); setRack(["V","I","P","S","L","O","T"].map((l,i)=>({id:`r${i}`,letter:l})));
              setBag(mkBag()); setPending([]); setSelId(null); setYou(0); setCpu(0);
              setSecs(20*60); setCpuIdx(0); setGameOver(false);
            }} className="mt-3 bg-white rounded-xl px-6 py-2">
              <Text className="text-red-500 font-bold text-sm">Play Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Prize Banner ── */}
        <PrizeBanner />
      </ScrollView>
    </View>
  );
}
