import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import YoutubePlayer from "react-native-youtube-iframe";

import {
  learningMaterialApi,
  learningProgressApi,
} from "@/api/api";

import {
  useLearningMaterials,
  useLearningProgress,
} from "@repo/hooks";

// ============================================================
// TYPES
// ============================================================

type Props = {
  materialId: string;
  moduleId: string;
  moduleIndex: number;
};

type MediaState = {
  imageError: boolean;
  videoError: boolean;
};

type ReaderPageType =
  | "welcome"
  | "objectives"
  | "section"
  | "summary"
  | "takeaways";

type ReaderPage = {
  type: ReaderPageType;
  sectionIndex?: number;
};

type LessonBlock = {
  id?: string;
  type: string;
  content?: string;
  text?: string;
  items?: string[];
  options?: string[];
  url?: string;
  imageUrl?: string;
  caption?: string;
};

type ParsedLessonContent = {
  version: number;
  objectives: string[];
  blocks: LessonBlock[];
  legacyContent: string;
};

type HtmlNode = {
  tag: string;
  text?: string;
  attributes?: Record<string, string>;
  children: HtmlNode[];
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

function parseHtmlContent(html: string): HtmlNode[] {
  const root: HtmlNode = {
    tag: "root",
    children: [],
  };

  const stack: HtmlNode[] = [root];

  const tokens =
    html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[^>]+>|[^<]+/g) ?? [];

  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr",
    "img", "input", "link", "meta", "param",
    "source", "track", "wbr",
  ]);

  for (const token of tokens) {
    if (
      token.startsWith("<!--") ||
      token.startsWith("<!")
    ) {
      continue;
    }

    if (!token.startsWith("<")) {
      const text = decodeHtmlEntities(token);

      if (text) {
        stack[stack.length - 1].children.push({
          tag: "#text",
          text,
          children: [],
        });
      }

      continue;
    }

    const closingMatch = token.match(/^<\/\s*([\w-]+)/);

    if (closingMatch) {
      const closingTag = closingMatch[1].toLowerCase();

      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === closingTag) {
          stack.length = i;
          break;
        }
      }

      continue;
    }

    const openingMatch = token.match(/^<\s*([\w-]+)/);

    if (!openingMatch) continue;

    const tag = openingMatch[1].toLowerCase();

    if (tag === "script" || tag === "style") {
      continue;
    }

    const attributes: Record<string, string> = {};

    const attributeText = token.slice(openingMatch[0].length);

    const attributeRegex =
      /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

    let attributeMatch: RegExpExecArray | null;

    while (
      (attributeMatch = attributeRegex.exec(attributeText)) !== null
    ) {
      attributes[attributeMatch[1].toLowerCase()] =
        decodeHtmlEntities(
          attributeMatch[2] ??
            attributeMatch[3] ??
            attributeMatch[4] ??
            "",
        );
    }

    const node: HtmlNode = {
      tag,
      attributes,
      children: [],
    };

    stack[stack.length - 1].children.push(node);

    const selfClosing =
      /\/\s*>$/.test(token) || voidTags.has(tag);

    if (!selfClosing) {
      stack.push(node);
    }
  }

  return root.children;
}

function containsHtml(value: string | null | undefined): boolean {
  if (!value) return false;

  return /<\/?(?:p|div|span|h[1-6]|ul|ol|li|strong|b|em|i|u|br|a|img|blockquote|hr)\b[^>]*>/i.test(
    value,
  );
}

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  primary: "#002B5C",
  primaryDark: "#001B3D",
  secondary: "#164B78",
  accent: "#65D5D6",
  background: "#F3F6FA",
  white: "#FFFFFF",
  text: "#14243A",
  muted: "#64748B",
  lightMuted: "#94A3B8",
  border: "#E4EAF1",
  softBlue: "#EDF4FB",
  softAccent: "#E9F8F8",
  success: "#218568",
  successSoft: "#E9F7F1",
  danger: "#C44B4B",
  dangerSoft: "#FFF1F1",
  darkMedia: "#101B2A",
};

// ============================================================
// HELPERS
// ============================================================
function normalizeStringList(value: unknown): string[] {
  const cleanItem = (item: unknown) =>
    decodeHtmlEntities(String(item ?? ""))
      .replace(/<\/?p[^>]*>/gi, "")
      .trim();

  if (Array.isArray(value)) {
    return value.map(cleanItem).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(cleanItem).filter(Boolean);
      }
    } catch {
      // Keep the value as ordinary text.
    }

    return [cleanItem(trimmed)].filter(Boolean);
  }

  return [];
}

function parseLessonContent(
  rawContent: string | null | undefined,
): ParsedLessonContent {
  const fallback: ParsedLessonContent = {
    version: 0,
    objectives: [],
    blocks: [],
    legacyContent: rawContent?.trim() ?? "",
  };

  if (!rawContent?.trim()) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(rawContent);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as { blocks?: unknown }).blocks)
    ) {
      return fallback;
    }

    const data = parsed as {
      version?: number;
      objectives?: unknown;
      blocks: unknown[];
    };

    const blocks: LessonBlock[] = data.blocks
      .filter(
        (block): block is Record<string, unknown> =>
          typeof block === "object" && block !== null,
      )
      .map((block, index) => ({
        id: String(block.id ?? `lesson-block-${index}`),
        type: String(block.type ?? "paragraph")
          .toLowerCase()
          .trim(),
        content: String(
          block.content ?? block.text ?? "",
        ),
        text: String(block.text ?? ""),
        items: normalizeStringList(
          block.items ?? block.options,
        ),
        options: normalizeStringList(block.options),
        url: String(
          block.url ?? block.imageUrl ?? "",
        ),
        imageUrl: String(block.imageUrl ?? ""),
        caption: String(block.caption ?? ""),
      }));

    return {
      version: Number(data.version ?? 1),
      objectives: normalizeStringList(data.objectives),
      blocks,
      legacyContent: "",
    };
  } catch {
    return fallback;
  }
}

function getYouTubeVideoId(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  const cleanUrl = url.trim();

  if (!cleanUrl) return null;

  try {
    const parsed = new URL(cleanUrl);

    const hostname = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return (
        parsed.pathname.split("/").filter(Boolean)[0] ??
        null
      );
    }

    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      const watchId = parsed.searchParams.get("v");

      if (watchId) return watchId;

      for (const path of ["/shorts/", "/embed/", "/live/"]) {
        if (parsed.pathname.startsWith(path)) {
          return (
            parsed.pathname.split("/").filter(Boolean)[1] ??
            null
          );
        }
      }
    }
  } catch {
    const patterns = [
      /youtu\.be\/([^?&#/]+)/i,
      /youtube\.com\/watch\?[^#]*v=([^&#]+)/i,
      /youtube\.com\/shorts\/([^?&#/]+)/i,
      /youtube\.com\/live\/([^?&#/]+)/i,
      /youtube\.com\/embed\/([^?&#/]+)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);

      if (match?.[1]) return match[1];
    }
  }

  return null;
}

// ============================================================
// COMPONENT
// ============================================================

export default function ModuleReader({
  materialId,
  moduleId,
  moduleIndex,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();

  const {
    modules,
    sections,
    isLoading,
    error,
    loadLearningMaterial,
    loadModules,
    loadSections,
  } = useLearningMaterials(learningMaterialApi);

  const {
    progress: learningProgress,
    isLoading: isProgressLoading,
    isCompleting,
    error: progressError,
    getMaterialProgress,
    completeSection,
  } = useLearningProgress(learningProgressApi);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [mediaState, setMediaState] = useState<MediaState>({
    imageError: false,
    videoError: false,
  });

  const loadedKeyRef = useRef<string | null>(null);
  const hasResumedRef = useRef(false);

  const [reloadKey, setReloadKey] = useState(0);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    const loadKey = `${materialId}:${moduleId}:${reloadKey}`;

    if (loadedKeyRef.current === loadKey) return;

    loadedKeyRef.current = loadKey;

    let isActive = true;

    const load = async () => {
      try {
        await loadLearningMaterial(materialId);
        if (!isActive) return;

        await loadModules(materialId);
        if (!isActive) return;

        await loadSections(moduleId);
        if (!isActive) return;

        await getMaterialProgress(materialId);
      } catch (loadError) {
        console.error("MODULE READER LOAD ERROR:", loadError);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [materialId, moduleId, reloadKey]);

  // ==========================================================
  // CURRENT MODULE
  // ==========================================================

  const currentModule = useMemo(
    () => modules.find((module) => module.id === moduleId) ?? null,
    [modules, moduleId],
  );

  const moduleWelcome = currentModule?.welcomeContent ?? "";

  const learningObjectives = useMemo(
    () => normalizeStringList(currentModule?.learningObjectives),
    [currentModule?.learningObjectives],
  );

  const moduleSummary = currentModule?.summary ?? "";

  const keyTakeaways = useMemo(
    () => normalizeStringList(currentModule?.keyTakeaways),
    [currentModule?.keyTakeaways],
  );

  // ==========================================================
  // READER PAGES
  // ==========================================================

  const readerPages = useMemo<ReaderPage[]>(() => {
    const pages: ReaderPage[] = [];

    if (moduleWelcome.trim()) {
      pages.push({ type: "welcome" });
    }

    if (learningObjectives.length > 0) {
      pages.push({ type: "objectives" });
    }

    sections.forEach((_, index) => {
      pages.push({
        type: "section",
        sectionIndex: index,
      });
    });

    if (moduleSummary.trim()) {
      pages.push({ type: "summary" });
    }

    if (keyTakeaways.length > 0) {
      pages.push({ type: "takeaways" });
    }

    return pages;
  }, [
    moduleWelcome,
    learningObjectives,
    sections,
    moduleSummary,
    keyTakeaways,
  ]);

  const currentPage = readerPages[currentPageIndex];

  const currentSection =
    currentPage?.type === "section" &&
    currentPage.sectionIndex !== undefined
      ? sections[currentPage.sectionIndex]
      : null;

  // ==========================================================
  // PARSE STRUCTURED LESSON CONTENT
  // ==========================================================

  const parsedLesson = useMemo(
    () => parseLessonContent(currentSection?.content),
    [currentSection?.content],
  );

  // ==========================================================
  // RESET MEDIA STATE
  // ==========================================================

  useEffect(() => {
    setMediaState({
      imageError: false,
      videoError: false,
    });
  }, [currentPageIndex]);

  // ==========================================================
  // RESUME PROGRESS
  // ==========================================================

  useEffect(() => {
    if (
      hasResumedRef.current ||
      readerPages.length === 0 ||
      !learningProgress
    ) {
      return;
    }

    const moduleProgress = learningProgress.modules?.find(
      (module) => module.moduleId === moduleId,
    );

    if (!moduleProgress) return;

    hasResumedRef.current = true;

    if (sections.length === 0) {
      setCurrentPageIndex(0);
      return;
    }

    const firstUnreadSectionIndex = sections.findIndex(
      (section) =>
        !moduleProgress.sections?.some(
          (progressSection) =>
            progressSection.sectionId === section.id &&
            progressSection.isRead,
        ),
    );

    if (firstUnreadSectionIndex >= 0) {
      const readerIndex = readerPages.findIndex(
        (page) =>
          page.type === "section" &&
          page.sectionIndex === firstUnreadSectionIndex,
      );

      if (readerIndex >= 0) {
        setCurrentPageIndex(readerIndex);
      }

      return;
    }

    setCurrentPageIndex(Math.max(readerPages.length - 1, 0));
  }, [readerPages, learningProgress, moduleId, sections]);

  // ==========================================================
  // MEDIA INFORMATION
  // ==========================================================

  const mediaUrl = currentSection?.mediaUrl?.trim() ?? "";

  const contentType =
    currentSection?.contentType?.trim().toLowerCase() ?? "";

  const isImage =
    contentType === "image" ||
    contentType.startsWith("image/");

  const isVideo =
    contentType === "video" ||
    contentType.startsWith("video/") ||
    contentType === "youtube" ||
    contentType === "youtube-video";

  const youtubeVideoId = mediaUrl
    ? getYouTubeVideoId(mediaUrl)
    : null;

  const isYoutubeVideo = Boolean(youtubeVideoId);

  const isCloudinaryImage =
    Boolean(
      mediaUrl &&
        (
          mediaUrl.includes("res.cloudinary.com") ||
          mediaUrl.includes("cloudinary.com")
        ) &&
        (
          mediaUrl.includes("/image/upload/") ||
          /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i.test(
            mediaUrl,
          )
        ),
    );

  const shouldRenderImage = Boolean(
    mediaUrl &&
      !isYoutubeVideo &&
      (isImage || isCloudinaryImage),
  );

  const shouldRenderYoutube = Boolean(
    mediaUrl && youtubeVideoId,
  );

  const shouldRenderNormalVideo = Boolean(
    mediaUrl &&
      isVideo &&
      !isYoutubeVideo &&
      !shouldRenderImage,
  );

  const shouldRenderUnknownMedia = Boolean(
    mediaUrl &&
      !shouldRenderImage &&
      !shouldRenderNormalVideo &&
      !shouldRenderYoutube,
  );

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress =
    readerPages.length > 0
      ? ((currentPageIndex + 1) / readerPages.length) * 100
      : 0;

  const isLastPage =
    currentPageIndex === readerPages.length - 1;

  const completedLessons =
    learningProgress?.modules?.find(
      (module) => module.moduleId === moduleId,
    )?.completedSections ?? 0;

  const totalLessons = sections.length;

  const pageLabel =
    currentPage?.type === "welcome"
      ? "MODULE INTRODUCTION"
      : currentPage?.type === "objectives"
        ? "LEARNING OBJECTIVES"
        : currentPage?.type === "section"
          ? `LESSON ${currentSection?.sectionNumber ?? ""}`
          : currentPage?.type === "summary"
            ? "MODULE SUMMARY"
            : "KEY TAKEAWAYS";

  const pageTitle =
    currentPage?.type === "welcome"
      ? "Welcome to the Module"
      : currentPage?.type === "objectives"
        ? "What You Will Learn"
        : currentPage?.type === "section"
          ? currentSection?.title ?? "Lesson"
          : currentPage?.type === "summary"
            ? "Module Summary"
            : "Key Takeaways";

  const videoWidth = Math.max(screenWidth - 76, 220);
  const videoHeight = videoWidth * (9 / 16);

  // ==========================================================
  // COMPLETE SECTION
  // ==========================================================

  const completeCurrentSection = async () => {
    if (!currentSection) return true;
    if (isCompleting) return false;

    try {
      const savedProgress = await completeSection(currentSection.id);
      return Boolean(savedProgress);
    } catch (completionError) {
      console.error(
        "SECTION COMPLETION ERROR:",
        completionError,
      );

      return false;
    }
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNext = async () => {
    if (isCompleting) return;

    if (currentPage?.type === "section") {
      const completed = await completeCurrentSection();
      if (!completed) return;
    }

    if (currentPageIndex < readerPages.length - 1) {
      setCurrentPageIndex((current) => current + 1);
      return;
    }

    router.back();
  };

  const handlePrevious = () => {
    if (currentPageIndex === 0 || isCompleting) return;

    setCurrentPageIndex((current) => current - 1);
  };

  const handleRetry = () => {
    loadedKeyRef.current = null;
    hasResumedRef.current = false;
    setCurrentPageIndex(0);
    setReloadKey((current) => current + 1);
  };

  const handleOpenVideo = async () => {
    if (!mediaUrl) return;

    try {
      await Linking.openURL(mediaUrl);
    } catch (openError) {
      console.error("Unable to open video:", openError);
    }
  };

  const renderHtmlNode = (
    node: HtmlNode,
    key: string,
    listType?: "ul" | "ol",
    itemIndex?: number,
  ): React.ReactNode => {
    if (node.tag === "#text") {
      return <Text key={key}>{node.text}</Text>;
    }

    const children = node.children.map((child, index) =>
      renderHtmlNode(child, `${key}-${index}`),
    );

    const tag = node.tag;

    // Images
    if (tag === "img") {
      const src = node.attributes?.src;

      if (!src) return null;

      return (
        <Image
          key={key}
          source={{ uri: src }}
          style={styles.blockImage}
          resizeMode="contain"
        />
      );
    }

    // Line break
    if (tag === "br") {
      return <Text key={key}>{"\n"}</Text>;
    }

    // Horizontal divider
    if (tag === "hr") {
      return (
        <View
          key={key}
          style={{
            height: 1,
            backgroundColor: COLORS.border,
            marginVertical: 12,
          }}
        />
      );
    }

    // Lists
    if (tag === "ul" || tag === "ol") {
      const listItems = node.children.filter(
        (child) => child.tag === "li",
      );

      return (
        <View key={key} style={styles.htmlList}>
          {listItems.map((item, index) => (
            <View
              key={`${key}-item-${index}`}
              style={styles.htmlListRow}
            >
              <Text style={styles.htmlListMarker}>
                {tag === "ol" ? `${index + 1}.` : "•"}
              </Text>

              <View style={styles.htmlListContent}>
                {renderHtmlNode(
                  item,
                  `${key}-li-${index}`,
                  tag,
                  index,
                )}
              </View>
            </View>
          ))}
        </View>
      );
    }

    // List item
    if (tag === "li") {
      return (
        <Text key={key} style={styles.htmlParagraph}>
          {children}
        </Text>
      );
    }

    // Paragraphs and headings
    if (
      tag === "p" ||
      tag === "h1" ||
      tag === "h2" ||
      tag === "h3" ||
      tag === "h4" ||
      tag === "h5" ||
      tag === "h6"
    ) {
      const headingStyle =
        tag === "h1"
          ? styles.htmlH1
          : tag === "h2"
            ? styles.htmlH2
            : tag === "h3"
              ? styles.htmlH3
              : tag !== "p"
                ? styles.htmlH4
                : styles.htmlParagraph;

      return (
        <Text key={key} style={headingStyle}>
          {children}
        </Text>
      );
    }

    // Links
    if (tag === "a") {
      const href = node.attributes?.href;

      return (
        <Text
          key={key}
          style={styles.htmlLink}
          onPress={() => {
            if (href) {
              void Linking.openURL(href).catch((linkError) =>
                console.error("Unable to open link:", linkError),
              );
            }
          }}
        >
          {children}
        </Text>
      );
    }

    // Inline formatting
    if (tag === "strong" || tag === "b") {
      return (
        <Text key={key} style={{ fontWeight: "900" }}>
          {children}
        </Text>
      );
    }

    if (tag === "em" || tag === "i") {
      return (
        <Text key={key} style={{ fontStyle: "italic" }}>
          {children}
        </Text>
      );
    }

    if (tag === "u") {
      return (
        <Text
          key={key}
          style={{ textDecorationLine: "underline" }}
        >
          {children}
        </Text>
      );
    }

    if (tag === "s" || tag === "del" || tag === "strike") {
      return (
        <Text
          key={key}
          style={{ textDecorationLine: "line-through" }}
        >
          {children}
        </Text>
      );
    }

    if (tag === "blockquote") {
      return (
        <View key={key} style={styles.htmlBlockquote}>
          <Text style={styles.htmlParagraph}>{children}</Text>
        </View>
      );
    }

    // Generic containers
    if (
      tag === "div" ||
      tag === "section" ||
      tag === "article" ||
      tag === "main"
    ) {
      return (
        <View key={key} style={styles.htmlContainer}>
          {children}
        </View>
      );
    }

    return (
      <Text key={key} style={styles.htmlParagraph}>
        {children}
      </Text>
    );
  };

  const renderHtmlContent = (html: string) => {
    const nodes = parseHtmlContent(html);

    return (
      <View style={styles.htmlContent}>
        {nodes.map((node, index) =>
          renderHtmlNode(node, `html-${index}`),
        )}
      </View>
    );
  };

  // ==========================================================
  // RENDER STRUCTURED LESSON BLOCKS
  // ==========================================================

  const renderLessonBlock = (
    block: LessonBlock,
    index: number,
  ) => {
    const type = block.type.toLowerCase().replace(/_/g, "-");

    const content = block.content || block.text || "";

    if (containsHtml(content)) {
      return (
        <View key={block.id ?? `html-block-${index}`}>
          {renderHtmlContent(content)}
        </View>
      );
    }

    const items =
      block.items?.length
        ? block.items
        : block.options ?? [];

    const imageUrl = block.url || block.imageUrl || "";

    switch (type) {
      case "heading":
      case "title":
      case "subheading":
        return (
          <Text
            key={block.id ?? `heading-${index}`}
            style={styles.blockHeading}
          >
            {content}
          </Text>
        );

      case "paragraph":
      case "text":
        return content.trim() ? (
          <Text
            key={block.id ?? `paragraph-${index}`}
            style={styles.blockParagraph}
          >
            {content}
          </Text>
        ) : null;

      case "bullet":
      case "bullets":
      case "bulletlist":
      case "bullet-list":
      case "unordered-list":
        return (
          <View
            key={block.id ?? `bullet-${index}`}
            style={styles.blockList}
          >
            {items.map((item, itemIndex) => {
              const itemHtml = containsHtml(item);
              return (
                <View
                  key={`${block.id ?? index}-bullet-${itemIndex}`}
                  style={styles.blockListRow}
                >
                  <Text style={styles.blockBullet}>•</Text>
                  {itemHtml ? (
                    <View style={styles.blockListContent}>
                      {renderHtmlContent(item)}
                    </View>
                  ) : (
                    <Text style={styles.blockListText}>{item}</Text>
                  )}
                </View>
              );
            })}
          </View>
        );

      case "number":
      case "numbered":
      case "numberedlist":
      case "numbered-list":
      case "ordered-list":
        return (
          <View
            key={block.id ?? `numbered-${index}`}
            style={styles.blockList}
          >
            {items.map((item, itemIndex) => {
              const itemHtml = containsHtml(item);
              return (
                <View
                  key={`${block.id ?? index}-number-${itemIndex}`}
                  style={styles.blockListRow}
                >
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>
                      {itemIndex + 1}
                    </Text>
                  </View>

                  {itemHtml ? (
                    <View style={styles.blockListContent}>
                      {renderHtmlContent(item)}
                    </View>
                  ) : (
                    <Text style={styles.blockListText}>{item}</Text>
                  )}
                </View>
              );
            })}
          </View>
        );

      case "choice":
      case "choices":
      case "radio":
      case "radio-choice":
      case "radio-choices":
      case "multiple-choice":
        return (
          <View
            key={block.id ?? `choices-${index}`}
            style={styles.choicesCard}
          >
            <Text style={styles.choicesTitle}>
              {content || "Choose the correct answer"}
            </Text>

            {items.map((item, itemIndex) => (
              <View
                key={`${block.id ?? index}-choice-${itemIndex}`}
                style={styles.choiceRow}
              >
                <View style={styles.radioCircle} />
                <Text style={styles.choiceText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        );

      case "image":
        if (!imageUrl) return null;

        return (
          <View
            key={block.id ?? `image-${index}`}
            style={styles.blockImageContainer}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.blockImage}
              resizeMode="contain"
            />

            {!!block.caption?.trim() && (
              <Text style={styles.blockImageCaption}>
                {block.caption}
              </Text>
            )}
          </View>
        );

      default:
        return content.trim() ? (
          <Text
            key={block.id ?? `default-${index}`}
            style={styles.blockParagraph}
          >
            {content}
          </Text>
        ) : null;
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if ((isLoading || isProgressLoading) && !currentModule) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>

        <Text style={styles.loadingTitle}>
          Preparing Your Lesson
        </Text>

        <Text style={styles.loadingText}>
          Please wait while we load your learning materials.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !currentModule) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="cloud-offline-outline"
            size={30}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Unable to Load Module
        </Text>

        <Text style={styles.errorText}>
          Something went wrong while loading this module.
        </Text>

        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (progressError && !learningProgress) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="analytics-outline"
            size={30}
            color={COLORS.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Unable to Load Progress
        </Text>

        <Text style={styles.errorText}>
          {progressError}
        </Text>

        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentModule) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="book-outline"
          size={42}
          color={COLORS.lightMuted}
        />

        <Text style={styles.errorTitle}>
          Module Not Found
        </Text>

        <Text style={styles.errorText}>
          The selected learning module could not be found.
        </Text>
      </View>
    );
  }

  if (readerPages.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="document-text-outline"
          size={42}
          color={COLORS.lightMuted}
        />

        <Text style={styles.errorTitle}>
          No Module Content
        </Text>

        <Text style={styles.errorText}>
          This module does not have any learning content yet.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.topHeader}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={COLORS.primary}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>
              ACE NEXTGEN LEARNING HUB
            </Text>

            <Text style={styles.headerTitle}>
              Module {moduleIndex + 1}
            </Text>
          </View>

          <View style={styles.headerPageBadge}>
            <Text style={styles.headerPageNumber}>
              {currentPageIndex + 1}
            </Text>

            <View style={styles.headerPageDivider} />

            <Text style={styles.headerPageTotal}>
              {readerPages.length}
            </Text>
          </View>
        </View>

        {/* PROGRESS */}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                Your Learning Progress
              </Text>

              <Text style={styles.progressSubtitle}>
                Page {currentPageIndex + 1} of {readerPages.length}
              </Text>
            </View>

            <View style={styles.progressPercentage}>
              <Text style={styles.progressPercentageText}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <View style={styles.progressFooterItem}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color={COLORS.secondary}
              />

              <Text style={styles.progressFooterText}>
                {readerPages.length} pages
              </Text>
            </View>

            <View style={styles.progressFooterItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={COLORS.success}
              />

              <Text style={styles.progressFooterText}>
                {completedLessons}/{totalLessons} lessons completed
              </Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}

        <View style={styles.contentSection}>
          <View style={styles.contentSectionHeader}>
            <Text style={styles.contentEyebrow}>
              MODULE CONTENT
            </Text>
          </View>

          <View style={styles.lessonCard}>
            {/* CARD HEADER */}

            <View style={styles.lessonCardHeader}>
              <View style={styles.lessonCardHeaderText}>
                <Text style={styles.lessonCardEyebrow}>
                  {pageLabel}
                </Text>

                <Text style={styles.lessonCardTitle}>
                  {pageTitle}
                </Text>
              </View>

              <View style={styles.lessonCardHeaderIcon}>
                <Ionicons
                  name={
                    currentPage?.type === "welcome"
                      ? "sparkles-outline"
                      : currentPage?.type === "objectives"
                        ? "locate-outline"
                        : currentPage?.type === "section"
                          ? "book-outline"
                          : currentPage?.type === "summary"
                            ? "document-text-outline"
                            : "checkmark-done-outline"
                  }
                  size={23}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.lessonCardDivider} />

            {/* WELCOME */}

            {currentPage?.type === "welcome" && (
              <View>
                <View style={styles.welcomeHero}>
                  <View style={styles.welcomeIcon}>
                    <Ionicons
                      name="hand-right-outline"
                      size={25}
                      color={COLORS.white}
                    />
                  </View>

                  <Text style={styles.welcomeEyebrow}>
                    ACE NEXTGEN LEARNING
                  </Text>

                  <Text style={styles.welcomeHeroTitle}>
                    Welcome aboard!
                  </Text>

                  <Text style={styles.welcomeHeroSubtitle}>
                    Let's begin your learning journey.
                    Explore the lessons and develop your
                    knowledge one step at a time.
                  </Text>
                </View>

                <View style={styles.contentTextCard}>
                  <Text style={styles.contentBlockLabel}>
                    ABOUT THIS MODULE
                  </Text>

                  <Text style={styles.lessonContent}>
                    {moduleWelcome}
                  </Text>
                </View>
              </View>
            )}

            {/* OBJECTIVES */}

            {currentPage?.type === "objectives" && (
              <View>
                <View style={styles.sectionIntroCard}>
                  <View style={styles.sectionIntroIcon}>
                    <Ionicons
                      name="flag-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.sectionIntroContent}>
                    <Text style={styles.sectionIntroTitle}>
                      What you will learn
                    </Text>

                    <Text style={styles.sectionIntroText}>
                      After completing this module,
                      you should be able to:
                    </Text>
                  </View>
                </View>

                <View style={styles.objectivesList}>
                  {learningObjectives.map((objective, index) => (
                    <View
                      key={`objective-${index}`}
                      style={styles.objectiveCard}
                    >
                      <View style={styles.objectiveNumber}>
                        <Text style={styles.objectiveNumberText}>
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                      </View>

                      <View style={styles.objectiveContent}>
                        <Text style={styles.objectiveLabel}>
                          LEARNING OBJECTIVE {index + 1}
                        </Text>

                        <Text style={styles.objectiveText}>
                          {objective}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* LESSON SECTION */}

            {currentPage?.type === "section" && currentSection && (
              <View>
                <View style={styles.lessonInfoBanner}>
                  <View style={styles.lessonInfoIcon}>
                    <Ionicons
                      name="book-outline"
                      size={21}
                      color={COLORS.white}
                    />
                  </View>

                  <View style={styles.lessonInfoContent}>
                    <Text style={styles.lessonInfoTitle}>
                      Lesson {currentSection.sectionNumber ?? ""}
                    </Text>

                    <Text style={styles.lessonInfoSubtitle}>
                      Read and understand the lesson carefully.
                    </Text>
                  </View>

                  <Ionicons
                    name="reader-outline"
                    size={21}
                    color={COLORS.secondary}
                  />
                </View>

                {/* STRUCTURED LESSON BODY */}

                <View style={styles.lessonBodyCard}>
                  <View style={styles.lessonBodyHeader}>
                    <View style={styles.lessonBodyAccent} />

                    <Text style={styles.contentBlockLabel}>
                      LESSON CONTENT
                    </Text>
                  </View>

                  {/* LESSON OBJECTIVES */}

                  {parsedLesson.objectives.length > 0 && (
                    <View style={styles.lessonObjectivesCard}>
                      <Text style={styles.lessonObjectivesTitle}>
                        LESSON OBJECTIVES
                      </Text>

                      {parsedLesson.objectives.map(
                        (objective, index) => (
                          <View
                            key={`lesson-objective-${index}`}
                            style={styles.lessonObjectiveRow}
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={17}
                              color={COLORS.success}
                            />

                            <Text style={styles.lessonObjectiveText}>
                              {objective}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  )}

                  {/* JSON BLOCKS */}

                  {parsedLesson.blocks.length > 0 ? (
                    <View style={styles.lessonBlocks}>
                      {parsedLesson.blocks.map(
                        (block, index) =>
                          renderLessonBlock(block, index),
                      )}
                    </View>
                  ) : parsedLesson.legacyContent ? (
                    <Text style={styles.lessonContent}>
                      {parsedLesson.legacyContent}
                    </Text>
                  ) : (
                    <View style={styles.noContentCard}>
                      <Ionicons
                        name="document-text-outline"
                        size={29}
                        color={COLORS.lightMuted}
                      />

                      <Text style={styles.noContentTitle}>
                        No lesson text available
                      </Text>

                      <Text style={styles.noContent}>
                        There is currently no written content
                        for this lesson.
                      </Text>
                    </View>
                  )}
                </View>

                {/* EXISTING IMAGE MEDIA */}

                {shouldRenderImage && (
                  <View style={styles.mediaSection}>
                    <View style={styles.mediaHeader}>
                      <View style={styles.mediaHeaderLeft}>
                        <View style={styles.mediaIcon}>
                          <Ionicons
                            name="image-outline"
                            size={19}
                            color={COLORS.primary}
                          />
                        </View>

                        <View style={styles.mediaHeaderText}>
                          <Text style={styles.mediaTitle}>
                            Lesson Image
                          </Text>

                          <Text style={styles.mediaSubtitle}>
                            Visual learning material
                          </Text>
                        </View>
                      </View>

                      <View style={styles.mediaTypePill}>
                        <Text style={styles.mediaTypeText}>
                          IMAGE
                        </Text>
                      </View>
                    </View>

                    {mediaState.imageError ? (
                      <View style={styles.mediaError}>
                        <View style={styles.mediaErrorIcon}>
                          <Ionicons
                            name="image-outline"
                            size={30}
                            color={COLORS.lightMuted}
                          />
                        </View>

                        <Text style={styles.mediaErrorTitle}>
                          Unable to load image
                        </Text>

                        <Text style={styles.mediaErrorText}>
                          The image could not be loaded.
                          Please try again.
                        </Text>

                        <Pressable
                          onPress={() =>
                            setMediaState((current) => ({
                              ...current,
                              imageError: false,
                            }))
                          }
                          style={styles.mediaRetryButton}
                        >
                          <Text style={styles.mediaRetryText}>
                            Reload Image
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View style={styles.imageWrapper}>
                        <Image
                          key={mediaUrl}
                          source={{ uri: mediaUrl }}
                          style={styles.lessonImage}
                          resizeMode="contain"
                          onError={() =>
                            setMediaState((current) => ({
                              ...current,
                              imageError: true,
                            }))
                          }
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* YOUTUBE */}

                {shouldRenderYoutube && (
                  <View style={styles.videoCard}>
                    <View style={styles.videoCardHeader}>
                      <View style={styles.videoHeaderLeft}>
                        <View style={styles.youtubeIcon}>
                          <Ionicons
                            name="logo-youtube"
                            size={19}
                            color={COLORS.white}
                          />
                        </View>

                        <View style={styles.videoHeaderText}>
                          <Text style={styles.videoTitle}>
                            Lesson Video
                          </Text>

                          <Text style={styles.videoSubtitle}>
                            Watch and understand the lesson
                          </Text>
                        </View>
                      </View>

                      <View style={styles.videoBadge}>
                        <Text style={styles.videoBadgeText}>
                          VIDEO
                        </Text>
                      </View>
                    </View>

                    {mediaState.videoError ? (
                      <View style={styles.videoError}>
                        <View style={styles.videoErrorIcon}>
                          <Ionicons
                            name="play-circle-outline"
                            size={35}
                            color={COLORS.lightMuted}
                          />
                        </View>

                        <Text style={styles.mediaErrorTitle}>
                          Unable to play video
                        </Text>

                        <Text style={styles.mediaErrorText}>
                          The video could not be loaded inside
                          the lesson.
                        </Text>

                        <Pressable
                          onPress={() =>
                            setMediaState((current) => ({
                              ...current,
                              videoError: false,
                            }))
                          }
                          style={styles.mediaRetryButton}
                        >
                          <Text style={styles.mediaRetryText}>
                            Reload Video
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => void handleOpenVideo()}
                          style={styles.openVideoButton}
                        >
                          <Ionicons
                            name="open-outline"
                            size={15}
                            color={COLORS.primary}
                          />

                          <Text style={styles.openVideoText}>
                            Open on YouTube
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <>
                        <View style={styles.youtubePlayerContainer}>
                          <YoutubePlayer
                            key={youtubeVideoId}
                            height={videoHeight}
                            width={videoWidth}
                            videoId={youtubeVideoId!}
                            play={false}
                            forceAndroidAutoplay={false}
                            initialPlayerParams={{
                              controls: true,
                              modestbranding: true,
                              rel: false,
                              playsinline: true,
                            }}
                            onError={(playerError: string) => {
                              console.log(
                                "YOUTUBE PLAYER ERROR:",
                                playerError,
                              );

                              setMediaState((current) => ({
                                ...current,
                                videoError: true,
                              }));
                            }}
                          />
                        </View>

                        <View style={styles.videoFooter}>
                          <Ionicons
                            name="information-circle-outline"
                            size={16}
                            color={COLORS.secondary}
                          />

                          <Text style={styles.videoFooterText}>
                            Watch the video before proceeding
                            to the next lesson.
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                )}

                {/* NORMAL VIDEO FILE */}

                {shouldRenderNormalVideo && (
                  <View style={styles.videoCard}>
                    <View style={styles.videoCardHeader}>
                      <View style={styles.videoHeaderLeft}>
                        <View style={styles.fileVideoIcon}>
                          <Ionicons
                            name="videocam"
                            size={19}
                            color={COLORS.white}
                          />
                        </View>

                        <View style={styles.videoHeaderText}>
                          <Text style={styles.videoTitle}>
                            Lesson Video
                          </Text>

                          <Text style={styles.videoSubtitle}>
                            Additional video resource
                          </Text>
                        </View>
                      </View>

                      <View style={styles.videoBadge}>
                        <Text style={styles.videoBadgeText}>
                          VIDEO FILE
                        </Text>
                      </View>
                    </View>

                    <View style={styles.normalVideoPreview}>
                      <View style={styles.normalVideoCircle}>
                        <Ionicons
                          name="play"
                          size={30}
                          color={COLORS.white}
                        />
                      </View>

                      <Text style={styles.normalVideoTitle}>
                        Watch the lesson video
                      </Text>

                      <Text style={styles.normalVideoDescription}>
                        This lesson contains an external video file.
                      </Text>

                      <Pressable
                        onPress={() => void handleOpenVideo()}
                        style={styles.playVideoButton}
                      >
                        <Ionicons
                          name="play"
                          size={16}
                          color={COLORS.white}
                        />

                        <Text style={styles.playVideoText}>
                          Open Video
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.videoFooter}>
                      <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color={COLORS.secondary}
                      />

                      <Text style={styles.videoFooterText}>
                        Open the video to view the additional
                        lesson material.
                      </Text>
                    </View>
                  </View>
                )}

                {/* UNKNOWN MEDIA */}

                {shouldRenderUnknownMedia && (
                  <View style={styles.resourceCard}>
                    <View style={styles.resourceIcon}>
                      <Ionicons
                        name="attach-outline"
                        size={22}
                        color={COLORS.secondary}
                      />
                    </View>

                    <View style={styles.resourceDetails}>
                      <Text style={styles.resourceTitle}>
                        Additional Resource
                      </Text>

                      <Text
                        style={styles.resourceUrl}
                        numberOfLines={2}
                      >
                        {mediaUrl}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => void handleOpenVideo()}
                      style={styles.resourceOpenButton}
                    >
                      <Ionicons
                        name="open-outline"
                        size={17}
                        color={COLORS.primary}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* SUMMARY */}

            {currentPage?.type === "summary" && (
              <View>
                <View style={styles.summaryHero}>
                  <View style={styles.summaryIcon}>
                    <Ionicons
                      name="clipboard-outline"
                      size={24}
                      color={COLORS.white}
                    />
                  </View>

                  <Text style={styles.summaryEyebrow}>
                    MODULE REVIEW
                  </Text>

                  <Text style={styles.summaryHeroTitle}>
                    Bringing it all together.
                  </Text>

                  <Text style={styles.summaryHeroSubtitle}>
                    Review the important concepts discussed
                    in this module.
                  </Text>
                </View>

                <View style={styles.contentTextCard}>
                  <Text style={styles.contentBlockLabel}>
                    MODULE SUMMARY
                  </Text>

                  <Text style={styles.lessonContent}>
                    {moduleSummary}
                  </Text>
                </View>
              </View>
            )}

            {/* KEY TAKEAWAYS */}

            {currentPage?.type === "takeaways" && (
              <View>
                <View style={styles.sectionIntroCard}>
                  <View style={styles.sectionIntroIcon}>
                    <Ionicons
                      name="bulb-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.sectionIntroContent}>
                    <Text style={styles.sectionIntroTitle}>
                      Remember these points
                    </Text>

                    <Text style={styles.sectionIntroText}>
                      Keep these important ideas in mind
                      after completing this module.
                    </Text>
                  </View>
                </View>

                <View style={styles.takeawaysList}>
                  {keyTakeaways.map((takeaway, index) => (
                    <View
                      key={`takeaway-${index}`}
                      style={styles.takeawayCard}
                    >
                      <View style={styles.takeawayCheck}>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.white}
                        />
                      </View>

                      <View style={styles.takeawayContent}>
                        <Text style={styles.takeawayLabel}>
                          KEY POINT {String(index + 1).padStart(2, "0")}
                        </Text>

                        <Text style={styles.takeawayText}>
                          {takeaway}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.completionBanner}>
                  <Ionicons
                    name="ribbon-outline"
                    size={26}
                    color={COLORS.success}
                  />

                  <View style={styles.completionTextContainer}>
                    <Text style={styles.completionTitle}>
                      Almost There!
                    </Text>

                    <Text style={styles.completionDescription}>
                      You have reached the final page of this module.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* LEARNING TIP */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={19}
              color={COLORS.secondary}
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Learning Tip
            </Text>

            <Text style={styles.tipText}>
              {currentPage?.type === "takeaways"
                ? "Review the key takeaways before finishing the module."
                : currentPage?.type === "objectives"
                  ? "Understand the learning objectives before continuing."
                  : currentPage?.type === "section"
                    ? "Read the lesson and review its media resources before moving forward."
                    : "Take your time and understand the content before proceeding."}
            </Text>
          </View>
        </View>

        {/* PAGE INDICATOR */}

        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            PAGE {currentPageIndex + 1} OF {readerPages.length}
          </Text>

          <View style={styles.pageDots}>
            {readerPages.map((_, index) => (
              <View
                key={`page-dot-${index}`}
                style={[
                  styles.pageDot,
                  index === currentPageIndex && styles.pageDotActive,
                  index < currentPageIndex && styles.pageDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomBar}>
        <Pressable
          onPress={handlePrevious}
          disabled={currentPageIndex === 0 || isCompleting}
          style={[
            styles.previousButton,
            (currentPageIndex === 0 || isCompleting) &&
              styles.disabledButton,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={17}
            color={COLORS.text}
          />

          <Text style={styles.previousText}>
            Previous
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void handleNext()}
          disabled={isCompleting}
          style={[
            styles.nextButton,
            isCompleting && styles.disabledButton,
          ]}
        >
          {isCompleting ? (
            <>
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />

              <Text style={styles.nextText}>
                Saving Progress...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.nextText}>
                {isLastPage ? "Finish Module" : "Continue"}
              </Text>

              <Ionicons
                name={
                  isLastPage
                    ? "checkmark-circle-outline"
                    : "arrow-forward"
                }
                size={18}
                color={COLORS.white}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 35,
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.lightMuted,
  },
  headerTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerPageBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    minWidth: 62,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  headerPageNumber: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
  },
  headerPageDivider: {
    width: 1,
    height: 13,
    marginHorizontal: 7,
    backgroundColor: "#FFFFFF55",
  },
  headerPageTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C5D7EA",
  },

  progressCard: {
    padding: 17,
    marginBottom: 25,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.text,
  },
  progressSubtitle: {
    marginTop: 4,
    fontSize: 9,
    color: COLORS.muted,
  },
  progressPercentage: {
    minWidth: 49,
    height: 37,
    paddingHorizontal: 8,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },
  progressPercentageText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E9EEF4",
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  progressFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 13,
  },
  progressFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  progressFooterText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.muted,
  },

  contentSection: { marginBottom: 17 },
  contentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  contentEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.secondary,
  },

  lessonCard: {
    padding: 19,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.045,
    shadowRadius: 13,
    elevation: 2,
  },
  lessonCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonCardHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  lessonCardEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.secondary,
  },
  lessonCardTitle: {
    marginTop: 6,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "900",
    color: COLORS.text,
  },
  lessonCardHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },
  lessonCardDivider: {
    height: 1,
    marginTop: 18,
    marginBottom: 19,
    backgroundColor: COLORS.border,
  },
  lessonContent: {
    fontSize: 13,
    lineHeight: 24,
    color: "#475569",
  },
  contentBlockLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.secondary,
  },
  contentTextCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F7FAFD",
    borderWidth: 1,
    borderColor: "#E7EEF5",
  },

  welcomeHero: {
    padding: 20,
    marginBottom: 17,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
  },
  welcomeIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF20",
    marginBottom: 17,
  },
  welcomeEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.accent,
  },
  welcomeHeroTitle: {
    marginTop: 8,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "900",
    color: COLORS.white,
  },
  welcomeHeroSubtitle: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 19,
    color: "#D3E2F0",
  },

  sectionIntroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: "#DCEAF4",
  },
  sectionIntroIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginRight: 11,
  },
  sectionIntroContent: { flex: 1 },
  sectionIntroTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },
  sectionIntroText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
  },
  objectivesList: { gap: 11 },
  objectiveCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#FAFCFE",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  objectiveNumber: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  objectiveNumberText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },
  objectiveContent: { flex: 1 },
  objectiveLabel: {
    marginBottom: 5,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.lightMuted,
  },
  objectiveText: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.text,
  },

  lessonInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 16,
    borderRadius: 15,
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: "#DCEAF4",
  },
  lessonInfoIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginRight: 11,
  },
  lessonInfoContent: { flex: 1 },
  lessonInfoTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },
  lessonInfoSubtitle: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 15,
    color: COLORS.muted,
  },

  lessonBodyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FAFCFE",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonBodyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  lessonBodyAccent: {
    width: 4,
    height: 17,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginRight: 9,
  },
  noContentCard: {
    padding: 23,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: COLORS.background,
  },
  noContentTitle: {
    marginTop: 9,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },
  noContent: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    color: COLORS.muted,
  },

  // STRUCTURED LESSON STYLES

  lessonObjectivesCard: {
    padding: 14,
    marginBottom: 17,
    borderRadius: 13,
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: "#DCEAF4",
  },
  lessonObjectivesTitle: {
    marginBottom: 11,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.primary,
  },
  lessonObjectiveRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 9,
  },
  lessonObjectiveText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.text,
  },
  lessonBlocks: { gap: 14 },
  blockHeading: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "900",
    color: COLORS.primary,
  },
  blockParagraph: {
    fontSize: 13,
    lineHeight: 24,
    color: "#475569",
  },
  blockList: { gap: 11 },
  blockListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  blockBullet: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  blockListText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 21,
    color: "#475569",
  },
  blockListContent: {
    flex: 1,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },
  numberBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.primary,
  },
  choicesCard: {
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#F7FAFD",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  choicesTitle: {
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 19,
    color: COLORS.text,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  radioCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  choiceText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: "#475569",
  },
  blockImageContainer: {
    padding: 10,
    borderRadius: 13,
    backgroundColor: "#F0F4F8",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  blockImage: {
    width: "100%",
    height: 230,
    borderRadius: 9,
    backgroundColor: COLORS.white,
  },
  blockImageCaption: {
    marginTop: 9,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    color: COLORS.muted,
  },

  mediaSection: {
    marginTop: 19,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mediaHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  mediaHeaderText: { flex: 1 },
  mediaIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softBlue,
  },
  mediaTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },
  mediaSubtitle: {
    marginTop: 4,
    fontSize: 9,
    color: COLORS.muted,
  },
  mediaTypePill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: COLORS.softBlue,
  },
  mediaTypeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: COLORS.primary,
  },
  imageWrapper: {
    width: "100%",
    minHeight: 210,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F4F8",
  },
  lessonImage: {
    width: "100%",
    height: 290,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  videoCard: {
    marginTop: 19,
    borderRadius: 17,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  videoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  videoHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  videoHeaderText: { flex: 1 },
  youtubeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
  },
  fileVideoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  videoTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },
  videoSubtitle: {
    marginTop: 4,
    fontSize: 9,
    color: COLORS.muted,
  },
  videoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: COLORS.dangerSoft,
  },
  videoBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.danger,
  },
  youtubePlayerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.darkMedia,
    paddingVertical: 2,
  },
  videoFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 13,
    backgroundColor: COLORS.softBlue,
  },
  videoFooterText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 15,
    color: COLORS.secondary,
  },
  normalVideoPreview: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 18,
    backgroundColor: COLORS.darkMedia,
  },
  normalVideoCircle: {
    width: 66,
    height: 66,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF24",
    borderWidth: 1,
    borderColor: "#FFFFFF55",
  },
  normalVideoTitle: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.white,
  },
  normalVideoDescription: {
    marginTop: 7,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    color: "#C5D2E0",
  },
  playVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 19,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  playVideoText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.white,
  },

  mediaError: {
    alignItems: "center",
    padding: 25,
    backgroundColor: COLORS.white,
  },
  mediaErrorIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  mediaErrorTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  mediaErrorText: {
    marginTop: 6,
    fontSize: 9,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: "center",
  },
  mediaRetryButton: {
    marginTop: 15,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  mediaRetryText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },
  videoError: {
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.white,
  },
  videoErrorIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  openVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 9,
  },
  openVideoText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
  },

  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 19,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.softBlue,
    borderWidth: 1,
    borderColor: "#DCEAF4",
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  resourceDetails: { flex: 1 },
  resourceTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.text,
  },
  resourceUrl: {
    marginTop: 4,
    fontSize: 8,
    lineHeight: 14,
    color: COLORS.muted,
  },
  resourceOpenButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  summaryHero: {
    padding: 19,
    marginBottom: 17,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF20",
    marginBottom: 16,
  },
  summaryEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.accent,
  },
  summaryHeroTitle: {
    marginTop: 8,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "900",
    color: COLORS.white,
  },
  summaryHeroSubtitle: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 18,
    color: "#D4E3F0",
  },

  takeawaysList: { gap: 11 },
  takeawayCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F8FBFD",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  takeawayCheck: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    marginRight: 11,
  },
  takeawayContent: { flex: 1 },
  takeawayLabel: {
    marginBottom: 5,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.lightMuted,
  },
  takeawayText: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.successSoft,
  },
  completionTextContainer: { flex: 1 },
  completionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.success,
  },
  completionDescription: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 15,
    color: "#527B70",
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    marginBottom: 18,
    borderRadius: 15,
    backgroundColor: COLORS.softAccent,
    borderWidth: 1,
    borderColor: "#D4EEEE",
  },
  tipIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D7F0EF",
  },
  tipContent: { flex: 1 },
  tipTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.primary,
  },
  tipText: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  pageIndicator: {
    alignItems: "center",
    marginBottom: 10,
  },
  pageIndicatorText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.lightMuted,
  },
  pageDots: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#D5DEE8",
  },
  pageDotActive: {
    width: 21,
    backgroundColor: COLORS.primary,
  },
  pageDotCompleted: {
    backgroundColor: COLORS.success,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 25,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previousButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minWidth: 112,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previousText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.text,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  nextText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.white,
  },
  disabledButton: { opacity: 0.45 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: COLORS.background,
  },
  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },
  loadingText: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    color: COLORS.muted,
  },
  errorIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    color: COLORS.muted,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 23,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },
    // HTML CONTENT STYLES

  htmlContent: {
    width: "100%",
    gap: 10,
  },
  htmlContainer: {
    gap: 9,
  },
  htmlParagraph: {
    fontSize: 13,
    lineHeight: 24,
    color: "#475569",
    marginBottom: 7,
  },
  htmlH1: {
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 9,
    marginBottom: 7,
  },
  htmlH2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 6,
  },
  htmlH3: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 7,
    marginBottom: 5,
  },
  htmlH4: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800",
    color: COLORS.secondary,
    marginTop: 5,
    marginBottom: 5,
  },
  htmlList: {
    gap: 10,
    marginVertical: 5,
  },
  htmlListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  htmlListMarker: {
    minWidth: 21,
    fontSize: 13,
    lineHeight: 23,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  htmlListContent: {
    flex: 1,
  },
  htmlLink: {
    color: "#1769AA",
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  htmlBlockquote: {
    paddingLeft: 13,
    paddingVertical: 5,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    backgroundColor: COLORS.softBlue,
  },
});