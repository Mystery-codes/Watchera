import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Movie = {
  id: number;
  title: string;
  year: number;
  rating: string;
  duration: string;
  genres: string[];
  description: string;
  poster: string;
  banner: string;
  subjectId?: string;
  detailPath?: string;
  subjectType?: number;
};

type CatalogRow = { title: string; movies: Movie[] };
type Tab = "Home" | "Search" | "My List" | "Profile";

const API_BASE = (process.env.EXPO_PUBLIC_WATCHERA_API_URL ?? "https://watchera.net").replace(/\/+$/, "");
const SAVED_KEY = "watchera.mobile.saved.v1";
const COLORS = {
  background: "#0a0a0a",
  surface: "#141414",
  surfaceRaised: "#1f1f1f",
  text: "#ededed",
  muted: "#a1a1aa",
  dim: "#71717a",
  accent: "#e50914",
  line: "#27272a",
};

const tabs: { name: Tab; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { name: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "Search", icon: "search-outline", activeIcon: "search" },
  { name: "My List", icon: "bookmark-outline", activeIcon: "bookmark" },
  { name: "Profile", icon: "person-circle-outline", activeIcon: "person-circle" },
];

function MovieCard({ movie, onPress }: { movie: Movie; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.movieCard, pressed && styles.pressed]}>
      <Image source={{ uri: movie.poster }} style={styles.poster} />
      <Text numberOfLines={1} style={styles.movieTitle}>{movie.title}</Text>
      <Text style={styles.movieYear}>{movie.year || "FEATURED"}</Text>
    </Pressable>
  );
}

function EmptyState({ icon, title, detail }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={28} color={COLORS.accent} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Home");
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [saved, setSaved] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [detail, setDetail] = useState<Movie | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const player = useVideoPlayer(null);

  async function loadCatalog(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/mobile/catalog`);
      if (!response.ok) throw new Error("Catalog is temporarily unavailable.");
      const data: { featured: Movie | null; rows: CatalogRow[] } = await response.json();
      setRows(data.rows ?? []);
      setFeatured(data.featured ?? null);
      setError("");
    } catch {
      setError("We couldn't load Watchera right now. Check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
    AsyncStorage.getItem(SAVED_KEY).then((value) => {
      if (value) setSaved(JSON.parse(value) as Movie[]);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDetail(selected);
    setPlaying(false);
    setPlayError("");
    player.pause();
    if (selected) {
      const id = selected.subjectId ?? selected.detailPath;
      if (id) {
        fetch(`${API_BASE}/api/episodes?subjectId=${encodeURIComponent(id)}`)
          .then((response) => response.ok ? response.json() : null)
          .then((data) => {
            if (!data || cancelled) return;
            setDetail((current) => current ? {
              ...current,
              description: data.description || current.description,
              genres: data.genres?.length ? data.genres : current.genres,
              year: data.year || current.year,
              duration: typeof data.duration === "string" ? data.duration : current.duration,
              rating: data.rating || current.rating,
            } : current);
          })
          .catch(() => undefined);
      }
    }
    return () => { cancelled = true; };
  }, [selected, player]);

  const allMovies = Array.from(new Map(rows.flatMap((row) => row.movies).map((movie) => [movie.subjectId ?? String(movie.id), movie])).values());
  const searchResults = query.trim()
    ? allMovies.filter((movie) => `${movie.title} ${movie.genres.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
    : allMovies;
  const activeRow = activeCategory ? rows.find((row) => row.title === activeCategory) : null;
  const isSaved = (movie: Movie) => saved.some((item) => (item.subjectId ?? item.id) === (movie.subjectId ?? movie.id));

  async function toggleSaved(movie: Movie) {
    const next = isSaved(movie)
      ? saved.filter((item) => (item.subjectId ?? item.id) !== (movie.subjectId ?? movie.id))
      : [movie, ...saved];
    setSaved(next);
    try {
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {}
  }

  async function startPlayback(movie: Movie) {
    const detailPath = movie.detailPath ?? movie.subjectId;
    if (!detailPath) {
      setPlayError("Playback isn't available for this title yet.");
      return;
    }
    setPlayError("");
    try {
      const params = new URLSearchParams({ detailPath, type: String(movie.subjectType ?? 1) });
      const response = await fetch(`${API_BASE}/api/play?${params.toString()}`);
      const data: { streamUrl?: string; error?: string } = await response.json();
      if (!response.ok || !data.streamUrl) throw new Error(data.error ?? "No stream is available for this title.");
      await player.replaceAsync({ uri: new URL(data.streamUrl, API_BASE).toString() });
      setPlaying(true);
      player.play();
    } catch (reason) {
      setPlayError(reason instanceof Error ? reason.message : "Unable to start playback.");
    }
  }

  function openMovie(movie: Movie) {
    setActiveCategory(null);
    setSelected(movie);
  }

  function renderShelves() {
    if (loading && rows.length === 0) {
      return <View style={styles.loading}><ActivityIndicator color={COLORS.accent} size="large" /><Text style={styles.mutedText}>Finding your next watch</Text></View>;
    }
    if (rows.length === 0) {
      return <EmptyState icon="cloud-offline-outline" title="Nothing to play yet" detail={error || "Pull down to try the catalog again."} />;
    }
    return rows.map((row) => (
      <View key={row.title} style={styles.shelf}>
        <View style={styles.shelfHeading}>
          <Text style={styles.sectionTitle}>{row.title}</Text>
          <Pressable onPress={() => setActiveCategory(row.title)} hitSlop={10}>
            <Ionicons name="arrow-forward" size={19} color={COLORS.accent} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfContent}>
          {row.movies.map((movie) => <MovieCard key={movie.subjectId ?? movie.id} movie={movie} onPress={() => openMovie(movie)} />)}
        </ScrollView>
      </View>
    ));
  }

  function renderHome() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadCatalog(true)} tintColor={COLORS.accent} />}
      >
        {featured && (
          <View style={styles.hero}>
            <Image source={{ uri: featured.banner || featured.poster }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["rgba(10,10,10,0.04)", "rgba(10,10,10,0.34)", COLORS.background]} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
            <View style={styles.heroTopline}><Text style={styles.brand}>watchera</Text><Text style={styles.liveLabel}>DISCOVER SOMETHING GOOD</Text></View>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>FEATURED TONIGHT</Text>
              <Text numberOfLines={2} style={styles.heroTitle}>{featured.title}</Text>
              <Text style={styles.heroMeta}>{[featured.year || null, featured.genres.slice(0, 2).join("  ·  ")].filter(Boolean).join("     ")}</Text>
              <View style={styles.heroActions}>
                <Pressable style={styles.playButton} onPress={() => openMovie(featured)}>
                  <Ionicons name="play" size={17} color="#fff" /><Text style={styles.playButtonText}>Discover</Text>
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => void toggleSaved(featured)} accessibilityLabel={isSaved(featured) ? "Remove from My List" : "Add to My List"}>
                  <Ionicons name={isSaved(featured) ? "bookmark" : "bookmark-outline"} size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
        {!!error && rows.length > 0 && <Text style={styles.inlineError}>{error}</Text>}
        {renderShelves()}
        <View style={{ height: 22 }} />
      </ScrollView>
    );
  }

  function renderSearch() {
    return (
      <ScrollView style={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Find a story</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Movies, series, genres" placeholderTextColor={COLORS.dim} style={styles.searchInput} returnKeyType="search" />
          {!!query && <Pressable onPress={() => setQuery("")} hitSlop={10}><Ionicons name="close-circle" size={19} color={COLORS.muted} /></Pressable>}
        </View>
        {loading && allMovies.length === 0 ? <View style={styles.loading}><ActivityIndicator color={COLORS.accent} /><Text style={styles.mutedText}>Loading titles</Text></View> : null}
        {!!error && allMovies.length === 0 ? <Text style={styles.inlineError}>{error}</Text> : null}
        {searchResults.length ? (
          <View style={styles.grid}>{searchResults.map((movie) => <MovieCard key={movie.subjectId ?? movie.id} movie={movie} onPress={() => openMovie(movie)} />)}</View>
        ) : !loading ? <EmptyState icon="film-outline" title="No matches" detail="Try another title or genre." /> : null}
        <View style={{ height: 28 }} />
      </ScrollView>
    );
  }

  function renderSaved() {
    return (
      <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My List</Text>
        <Text style={styles.pageSubtitle}>{saved.length} {saved.length === 1 ? "title" : "titles"} saved on this device</Text>
        {saved.length ? <View style={styles.grid}>{saved.map((movie) => <MovieCard key={movie.subjectId ?? movie.id} movie={movie} onPress={() => openMovie(movie)} />)}</View> : <EmptyState icon="bookmark-outline" title="Keep the good ones close" detail="Save a movie or series and it will be waiting here." />}
        <View style={{ height: 28 }} />
      </ScrollView>
    );
  }

  function renderProfile() {
    return (
      <ScrollView style={styles.page}>
        <Text style={styles.pageTitle}>Your Watchera</Text>
        <View style={styles.profileMark}><Ionicons name="play" size={28} color="#fff" /></View>
        <Text style={styles.profileTitle}>Your next favorite is out there.</Text>
        <Text style={styles.profileCopy}>Sign in to your Watchera account on the web to manage your account and preferences.</Text>
        <Pressable style={styles.webButton} onPress={() => void Linking.openURL(`${API_BASE}/account`)}>
          <Text style={styles.webButtonText}>Open Watchera account</Text><Ionicons name="open-outline" size={17} color={COLORS.text} />
        </Pressable>
        <Text style={styles.version}>WATCHERA  ·  MOBILE</Text>
      </ScrollView>
    );
  }

  function renderCategory() {
    if (!activeRow) return null;
    return (
      <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => setActiveCategory(null)}><Ionicons name="arrow-back" size={20} color={COLORS.text} /><Text style={styles.backText}>Discover</Text></Pressable>
        <Text style={styles.pageTitle}>{activeRow.title}</Text>
        <View style={styles.grid}>{activeRow.movies.map((movie) => <MovieCard key={movie.subjectId ?? movie.id} movie={movie} onPress={() => openMovie(movie)} />)}</View>
        <View style={{ height: 28 }} />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <View style={styles.content}>
          {activeCategory ? renderCategory() : tab === "Home" ? renderHome() : tab === "Search" ? renderSearch() : tab === "My List" ? renderSaved() : renderProfile()}
        </View>
        <View style={styles.tabBar}>
          {tabs.map((item) => {
            const active = tab === item.name;
            return (
              <Pressable key={item.name} onPress={() => { setActiveCategory(null); setTab(item.name); }} style={styles.tabItem}>
                <Ionicons name={active ? item.activeIcon : item.icon} size={21} color={active ? COLORS.accent : COLORS.dim} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.modalClose} onPress={() => { setSelected(null); setPlaying(false); player.pause(); }} accessibilityLabel="Close details"><Ionicons name="close" size={22} color={COLORS.text} /></Pressable>
            <Text numberOfLines={1} style={styles.modalHeaderTitle}>{detail?.title ?? "Title details"}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            {playing ? <VideoView player={player} style={styles.video} nativeControls contentFit="contain" fullscreenOptions={{ enable: true }} /> : (
              <View style={styles.detailArtwork}>
                <Image source={{ uri: detail?.banner || detail?.poster }} style={StyleSheet.absoluteFill} />
                <LinearGradient colors={["transparent", COLORS.background]} style={StyleSheet.absoluteFill} />
              </View>
            )}
            <Text style={styles.detailTitle}>{detail?.title ?? selected?.title}</Text>
            <Text style={styles.detailMeta}>{[detail?.year, detail?.duration !== "—" ? detail?.duration : null, detail?.rating].filter(Boolean).join("   ·   ")}</Text>
            <View style={styles.genreList}>{(detail?.genres ?? []).map((genre) => <Text style={styles.genre} key={genre}>{genre}</Text>)}</View>
            {!!detail?.description && <Text style={styles.description}>{detail.description}</Text>}
            <View style={styles.detailActions}>
              <Pressable style={styles.watchButton} onPress={() => detail && void startPlayback(detail)}>
                <Ionicons name={playing ? "refresh" : "play"} size={19} color="#fff" /><Text style={styles.watchButtonText}>{playing ? "Restart playback" : "Play now"}</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={() => detail && void toggleSaved(detail)}>
                <Ionicons name={detail && isSaved(detail) ? "bookmark" : "bookmark-outline"} size={20} color={COLORS.text} />
                <Text style={styles.saveButtonText}>{detail && isSaved(detail) ? "Saved" : "My List"}</Text>
              </Pressable>
            </View>
            {!!playError && <Text style={styles.playError}>{playError}</Text>}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  app: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  hero: { height: 510, justifyContent: "space-between", overflow: "hidden", backgroundColor: COLORS.surface },
  heroTopline: { paddingTop: 16, paddingHorizontal: 23, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: COLORS.text, fontSize: 24, fontWeight: "900", letterSpacing: 0 },
  liveLabel: { color: "#f3d9d4", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  heroCopy: { paddingHorizontal: 23, paddingBottom: 24 },
  eyebrow: { color: COLORS.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.7, marginBottom: 9 },
  heroTitle: { color: COLORS.text, fontSize: 34, lineHeight: 39, fontWeight: "900", maxWidth: 340 },
  heroMeta: { color: "#d0d4d0", fontSize: 12, marginTop: 10 },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 17 },
  playButton: { backgroundColor: COLORS.accent, height: 44, paddingHorizontal: 18, borderRadius: 5, flexDirection: "row", alignItems: "center", gap: 8 },
  playButtonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  iconButton: { width: 44, height: 44, borderRadius: 5, borderColor: "#ffffff80", borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a66" },
  shelf: { marginTop: 17 },
  shelfHeading: { paddingHorizontal: 20, marginBottom: 11, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800" },
  shelfContent: { paddingHorizontal: 20, gap: 12 },
  movieCard: { width: 122, marginBottom: 3 },
  pressed: { opacity: 0.78 },
  poster: { width: 122, height: 181, borderRadius: 5, backgroundColor: COLORS.surfaceRaised },
  movieTitle: { color: COLORS.text, fontSize: 12, fontWeight: "700", marginTop: 8 },
  movieYear: { color: COLORS.dim, fontSize: 10, marginTop: 3 },
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 19 },
  pageTitle: { color: COLORS.text, fontSize: 28, fontWeight: "900", marginBottom: 8 },
  pageSubtitle: { color: COLORS.muted, fontSize: 13, marginBottom: 18 },
  searchBox: { minHeight: 49, borderRadius: 6, backgroundColor: COLORS.surfaceRaised, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 13, marginTop: 12, marginBottom: 22, borderWidth: 1, borderColor: COLORS.line },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 17, paddingTop: 13 },
  emptyState: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 72, gap: 11 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyDetail: { color: COLORS.muted, fontSize: 13, textAlign: "center", lineHeight: 19 },
  loading: { alignItems: "center", paddingTop: 70, gap: 13 },
  mutedText: { color: COLORS.muted, fontSize: 13 },
  inlineError: { color: "#f3a5a3", fontSize: 13, paddingHorizontal: 20, paddingVertical: 12 },
  tabBar: { height: 62, paddingHorizontal: 7, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.surface, flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  tabItem: { flex: 1, height: 56, alignItems: "center", justifyContent: "center", gap: 3 },
  tabLabel: { color: COLORS.dim, fontSize: 10, fontWeight: "600" },
  tabLabelActive: { color: COLORS.accent },
  backButton: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 10, marginBottom: 13 },
  backText: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  profileMark: { width: 62, height: 62, marginTop: 29, borderRadius: 15, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  profileTitle: { color: COLORS.text, fontSize: 22, lineHeight: 28, fontWeight: "900", marginTop: 22, maxWidth: 270 },
  profileCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 320 },
  webButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: COLORS.surfaceRaised, borderRadius: 5, paddingVertical: 13, paddingHorizontal: 15, marginTop: 22, borderWidth: 1, borderColor: COLORS.line },
  webButtonText: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  version: { color: COLORS.dim, fontSize: 10, letterSpacing: 1.2, marginTop: 45 },
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { height: 51, paddingHorizontal: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.line },
  modalClose: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  modalHeaderTitle: { color: COLORS.text, fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },
  modalBody: { paddingBottom: 32 },
  detailArtwork: { height: 250, overflow: "hidden", backgroundColor: COLORS.surface },
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  detailTitle: { color: COLORS.text, fontSize: 26, lineHeight: 31, fontWeight: "900", paddingHorizontal: 21, marginTop: 2 },
  detailMeta: { color: COLORS.muted, fontSize: 12, paddingHorizontal: 21, marginTop: 9 },
  genreList: { flexDirection: "row", flexWrap: "wrap", gap: 7, paddingHorizontal: 21, marginTop: 14 },
  genre: { color: COLORS.accent, fontSize: 11, fontWeight: "700", borderWidth: 1, borderColor: "#e509144d", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 4, overflow: "hidden" },
  description: { color: "#d0d4d0", fontSize: 14, lineHeight: 21, paddingHorizontal: 21, marginTop: 17 },
  detailActions: { flexDirection: "row", gap: 10, paddingHorizontal: 21, marginTop: 22 },
  watchButton: { flex: 1, minHeight: 47, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.accent, borderRadius: 5 },
  watchButtonText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  saveButton: { minWidth: 104, minHeight: 47, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: COLORS.surfaceRaised, borderWidth: 1, borderColor: COLORS.line, borderRadius: 5 },
  saveButtonText: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  playError: { color: "#f3a5a3", fontSize: 13, lineHeight: 19, paddingHorizontal: 21, marginTop: 14 },
});
