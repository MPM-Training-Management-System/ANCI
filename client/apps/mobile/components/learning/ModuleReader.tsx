import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

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

// ============================================================
// YOUTUBE VIDEO ID
// ============================================================

function getYouTubeVideoId(
  url: string | null | undefined,
): string | null {
  if (!url) {
    return null;
  }

  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return null;
  }

  try {
    const parsed = new URL(cleanUrl);

    const hostname = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    // ========================================================
    // youtu.be/VIDEO_ID
    // ========================================================

    if (hostname === "youtu.be") {
      const videoId = parsed.pathname
        .split("/")
        .filter(Boolean)[0];

      return videoId || null;
    }

    // ========================================================
    // youtube.com
    // ========================================================

    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      // ======================================================
      // youtube.com/watch?v=VIDEO_ID
      // ======================================================

      const watchId =
        parsed.searchParams.get("v");

      if (watchId) {
        return watchId;
      }

      // ======================================================
      // youtube.com/shorts/VIDEO_ID
      // ======================================================

      if (
        parsed.pathname.startsWith(
          "/shorts/",
        )
      ) {
        const videoId =
          parsed.pathname
            .split("/")
            .filter(Boolean)[1];

        return videoId || null;
      }

      // ======================================================
      // youtube.com/embed/VIDEO_ID
      // ======================================================

      if (
        parsed.pathname.startsWith(
          "/embed/",
        )
      ) {
        const videoId =
          parsed.pathname
            .split("/")
            .filter(Boolean)[1];

        return videoId || null;
      }

      // ======================================================
      // youtube.com/live/VIDEO_ID
      // ======================================================

      if (
        parsed.pathname.startsWith(
          "/live/",
        )
      ) {
        const videoId =
          parsed.pathname
            .split("/")
            .filter(Boolean)[1];

        return videoId || null;
      }
    }
  } catch {
    // ========================================================
    // FALLBACK
    // ========================================================

    const shortMatch =
      cleanUrl.match(
        /youtu\.be\/([^?&#/]+)/i,
      );

    if (shortMatch?.[1]) {
      return shortMatch[1];
    }

    const watchMatch =
      cleanUrl.match(
        /youtube\.com\/watch\?[^#]*v=([^&#]+)/i,
      );

    if (watchMatch?.[1]) {
      return watchMatch[1];
    }

    const shortsMatch =
      cleanUrl.match(
        /youtube\.com\/shorts\/([^?&#/]+)/i,
      );

    if (shortsMatch?.[1]) {
      return shortsMatch[1];
    }

    const liveMatch =
      cleanUrl.match(
        /youtube\.com\/live\/([^?&#/]+)/i,
      );

    if (liveMatch?.[1]) {
      return liveMatch[1];
    }

    const embedMatch =
      cleanUrl.match(
        /youtube\.com\/embed\/([^?&#/]+)/i,
      );

    if (embedMatch?.[1]) {
      return embedMatch[1];
    }
  }

  return null;
}

// ============================================================
// NORMALIZE STRING LIST
// ============================================================

function normalizeStringList(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item ?? "").trim(),
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            String(item ?? "").trim(),
          )
          .filter(Boolean);
      }
    } catch {
      // Not JSON.
    }

    return [trimmed];
  }

  return [];
}

// ============================================================
// COMPONENT
// ============================================================

export default function ModuleReader({
  materialId,
  moduleId,
  moduleIndex,
}: Props) {
  // ==========================================================
  // SCREEN SIZE
  // ==========================================================

  const {
    width: screenWidth,
  } = useWindowDimensions();

  // ==========================================================
  // LEARNING MATERIAL
  // ==========================================================

  const {
    selectedMaterial,
    modules,
    sections,
    isLoading,
    error,
    loadLearningMaterial,
    loadModules,
    loadSections,
  } = useLearningMaterials(
    learningMaterialApi,
  );

  // ==========================================================
  // LEARNING PROGRESS
  // ==========================================================

  const {
    progress: learningProgress,
    isLoading: isProgressLoading,
    isCompleting,
    error: progressError,
    getMaterialProgress,
    completeSection,
  } = useLearningProgress(
    learningProgressApi,
  );

  // ==========================================================
  // CURRENT READER PAGE
  // ==========================================================

  const [
    currentPageIndex,
    setCurrentPageIndex,
  ] = useState(0);

  // ==========================================================
  // MEDIA STATE
  // ==========================================================

  const [
    mediaState,
    setMediaState,
  ] = useState<MediaState>({
    imageError: false,
    videoError: false,
  });

  // ==========================================================
  // STABLE LOAD CONTROL
  // ==========================================================

  const loadedKeyRef =
    useRef<string | null>(null);

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  // ==========================================================
  // LOAD MATERIAL + MODULE + PROGRESS
  // ==========================================================

  useEffect(() => {
    const loadKey =
      `${materialId}:${moduleId}:${reloadKey}`;

    if (
      loadedKeyRef.current === loadKey
    ) {
      return;
    }

    loadedKeyRef.current =
      loadKey;

    const load = async () => {
      try {
        await loadLearningMaterial(
          materialId,
        );

        await loadModules(
          materialId,
        );

        await loadSections(
          moduleId,
        );

        await getMaterialProgress(
          materialId,
        );
      } catch {
        // Errors handled by hooks.
      }
    };

    void load();
  }, [
    materialId,
    moduleId,
    reloadKey,
  ]);

  // ==========================================================
  // CURRENT MODULE
  // ==========================================================

  const currentModule =
    useMemo(
      () =>
        modules.find(
          (module) =>
            module.id === moduleId,
        ) ?? null,
      [
        modules,
        moduleId,
      ],
    );

  // ==========================================================
  // MODULE CONTENT
  //
  // The module-level fields are:
  //
  // welcome
  // learningObjectives
  // summary
  // keyTakeaways
  //
  // ==========================================================

  const moduleWelcome =
    currentModule?.welcomeContent ??
    "";

  const learningObjectives =
    normalizeStringList(
      currentModule?.learningObjectives,
    );

  const moduleSummary =
    currentModule?.summary ??
    "";

  const keyTakeaways =
    normalizeStringList(
      currentModule?.keyTakeaways,
    );

  // ==========================================================
  // BUILD READER PAGES
  //
  // ORDER:
  //
  // 1. Welcome
  // 2. Objectives
  // 3. Sections
  // 4. Summary
  // 5. Key Takeaways
  //
  // ==========================================================

  const readerPages =
    useMemo<ReaderPage[]>(() => {
      const pages: ReaderPage[] = [];

      // ------------------------------------------------------
      // WELCOME
      // ------------------------------------------------------

      if (
        moduleWelcome.trim()
      ) {
        pages.push({
          type: "welcome",
        });
      }

      // ------------------------------------------------------
      // OBJECTIVES
      // ------------------------------------------------------

      if (
        learningObjectives.length > 0
      ) {
        pages.push({
          type: "objectives",
        });
      }

      // ------------------------------------------------------
      // LESSON SECTIONS
      // ------------------------------------------------------

      sections.forEach(
        (_, index) => {
          pages.push({
            type: "section",
            sectionIndex: index,
          });
        },
      );

      // ------------------------------------------------------
      // SUMMARY
      // ------------------------------------------------------

      if (
        moduleSummary.trim()
      ) {
        pages.push({
          type: "summary",
        });
      }

      // ------------------------------------------------------
      // KEY TAKEAWAYS
      // ------------------------------------------------------

      if (
        keyTakeaways.length > 0
      ) {
        pages.push({
          type: "takeaways",
        });
      }

      return pages;
    }, [
      moduleWelcome,
      learningObjectives,
      sections,
      moduleSummary,
      keyTakeaways,
    ]);

  // ==========================================================
  // CURRENT PAGE
  // ==========================================================

  const currentPage =
    readerPages[
      currentPageIndex
    ];

  // ==========================================================
  // CURRENT SECTION
  // ==========================================================

  const currentSection =
    currentPage?.type === "section" &&
    currentPage.sectionIndex !==
      undefined
      ? sections[
          currentPage.sectionIndex
        ]
      : null;

  // ==========================================================
  // RESET MEDIA WHEN PAGE CHANGES
  // ==========================================================

  useEffect(() => {
    setMediaState({
      imageError: false,
      videoError: false,
    });
  }, [
    currentPageIndex,
  ]);

  // ==========================================================
  // RESUME FIRST UNREAD SECTION
  //
  // Welcome/objectives are informational pages.
  // Section progress remains based on actual lessons.
  //
  // ==========================================================

  useEffect(() => {
    if (
      readerPages.length === 0
    ) {
      return;
    }

    if (!learningProgress) {
      return;
    }

    const moduleProgress =
      learningProgress.modules.find(
        (module) =>
          module.moduleId ===
          moduleId,
      );

    if (!moduleProgress) {
      return;
    }

    if (sections.length === 0) {
      setCurrentPageIndex(0);
      return;
    }

    const firstUnreadSectionIndex =
      sections.findIndex(
        (section) =>
          !moduleProgress.sections.some(
            (progressSection) =>
              progressSection.sectionId ===
                section.id &&
              progressSection.isRead,
          ),
      );

    if (
      firstUnreadSectionIndex >= 0
    ) {
      const readerIndex =
        readerPages.findIndex(
          (page) =>
            page.type === "section" &&
            page.sectionIndex ===
              firstUnreadSectionIndex,
        );

      if (readerIndex >= 0) {
        setCurrentPageIndex(
          readerIndex,
        );
      }

      return;
    }

    // All lessons are already completed.
    // Open the last informational page.
    setCurrentPageIndex(
      Math.max(
        readerPages.length - 1,
        0,
      ),
    );
  }, [
    readerPages,
    learningProgress,
    moduleId,
    sections,
  ]);

  // ==========================================================
  // MEDIA INFORMATION
  // ==========================================================

  const mediaUrl =
    currentSection?.mediaUrl?.trim() ??
    "";

  const contentType =
    currentSection?.contentType
      ?.trim()
      .toLowerCase() ?? "";

  // ==========================================================
  // IMAGE DETECTION
  // ==========================================================

  const isImage =
    contentType === "image" ||
    contentType.startsWith("image/");

  // ==========================================================
  // VIDEO DETECTION
  // ==========================================================

  const isVideo =
    contentType === "video" ||
    contentType.startsWith("video/") ||
    contentType === "youtube" ||
    contentType === "youtube-video";

  // ==========================================================
  // YOUTUBE VIDEO ID
  // ==========================================================

  const youtubeVideoId =
    mediaUrl
      ? getYouTubeVideoId(
          mediaUrl,
        )
      : null;

  const isYoutubeVideo =
    Boolean(youtubeVideoId);

  // ==========================================================
  // CLOUDINARY IMAGE DETECTION
  // ==========================================================

  const isCloudinaryImage =
    Boolean(
      mediaUrl &&
        (
          mediaUrl.includes(
            "res.cloudinary.com",
          ) ||
          mediaUrl.includes(
            "cloudinary.com",
          )
        ) &&
        (
          mediaUrl.includes(
            "/image/upload/",
          ) ||
          Boolean(
            mediaUrl.match(
              /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i,
            ),
          )
        ),
    );

  // ==========================================================
  // FINAL IMAGE DETECTION
  // ==========================================================

  const shouldRenderImage =
    Boolean(
      mediaUrl &&
        !isYoutubeVideo &&
        (
          isImage ||
          isCloudinaryImage
        ),
    );

  // ==========================================================
  // YOUTUBE
  // ==========================================================

  const shouldRenderYoutube =
    Boolean(
      mediaUrl &&
        youtubeVideoId,
    );

  // ==========================================================
  // NORMAL VIDEO
  // ==========================================================

  const shouldRenderNormalVideo =
    Boolean(
      mediaUrl &&
        isVideo &&
        !isYoutubeVideo &&
        !shouldRenderImage,
    );

  // ==========================================================
  // UNKNOWN MEDIA
  // ==========================================================

  const shouldRenderUnknownMedia =
    Boolean(
      mediaUrl &&
        !shouldRenderImage &&
        !shouldRenderNormalVideo &&
        !shouldRenderYoutube,
    );

  // ==========================================================
  // DEBUG
  // ==========================================================

  useEffect(() => {
    console.log(
      "========================================",
    );

    console.log(
      "MODULE READER",
    );

    console.log(
      "CURRENT MODULE:",
      JSON.stringify(
        currentModule,
        null,
        2,
      ),
    );

    console.log(
      "READER PAGES:",
      readerPages,
    );

    console.log(
      "CURRENT PAGE:",
      currentPage,
    );

    console.log(
      "CURRENT SECTION:",
      JSON.stringify(
        currentSection,
        null,
        2,
      ),
    );

    console.log(
      "WELCOME:",
      moduleWelcome,
    );

    console.log(
      "OBJECTIVES:",
      learningObjectives,
    );

    console.log(
      "SUMMARY:",
      moduleSummary,
    );

    console.log(
      "KEY TAKEAWAYS:",
      keyTakeaways,
    );

    console.log(
      "========================================",
    );
  }, [
    currentModule,
    readerPages,
    currentPage,
    currentSection,
    moduleWelcome,
    learningObjectives,
    moduleSummary,
    keyTakeaways,
  ]);

  // ==========================================================
  // VIDEO DIMENSIONS
  // ==========================================================

  const videoWidth =
    Math.max(
      screenWidth - 36,
      240,
    );

  const videoHeight =
    videoWidth * (9 / 16);

  // ==========================================================
  // COMPLETE CURRENT SECTION
  // ==========================================================

  const completeCurrentSection =
    async () => {
      if (
        !currentSection
      ) {
        return true;
      }

      if (isCompleting) {
        return false;
      }

      const savedProgress =
        await completeSection(
          currentSection.id,
        );

      return Boolean(
        savedProgress,
      );
    };

  // ==========================================================
  // NEXT
  // ==========================================================

  const handleNext =
    async () => {
      if (isCompleting) {
        return;
      }

      // ------------------------------------------------------
      // If this is an actual lesson, save its progress first.
      // ------------------------------------------------------

      if (
        currentPage?.type ===
        "section"
      ) {
        const completed =
          await completeCurrentSection();

        if (!completed) {
          return;
        }
      }

      // ------------------------------------------------------
      // Next page
      // ------------------------------------------------------

      if (
        currentPageIndex <
        readerPages.length - 1
      ) {
        setCurrentPageIndex(
          (current) =>
            current + 1,
        );

        return;
      }

      // ------------------------------------------------------
      // LAST PAGE
      // ------------------------------------------------------

      router.back();
    };

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  const handlePrevious =
    () => {
      if (
        currentPageIndex === 0 ||
        isCompleting
      ) {
        return;
      }

      setCurrentPageIndex(
        (current) =>
          current - 1,
      );
    };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry =
    () => {
      loadedKeyRef.current =
        null;

      setReloadKey(
        (current) =>
          current + 1,
      );
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    (isLoading ||
      isProgressLoading) &&
    !currentModule
  ) {
    return (
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color="#002B5C"
        />

        <Text
          style={styles.loadingText}
        >
          Loading module...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    !currentModule
  ) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorTitle}
        >
          Unable to Load Module
        </Text>

        <Pressable
          onPress={handleRetry}
          style={styles.retryButton}
        >
          <Text
            style={styles.retryText}
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================================
  // PROGRESS ERROR
  // ==========================================================

  if (
    progressError &&
    !learningProgress
  ) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorTitle}
        >
          Unable to Load Progress
        </Text>

        <Text
          style={styles.errorText}
        >
          {progressError}
        </Text>

        <Pressable
          onPress={handleRetry}
          style={styles.retryButton}
        >
          <Text
            style={styles.retryText}
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================================
  // NO MODULE
  // ==========================================================

  if (!currentModule) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorTitle}
        >
          Module Not Found
        </Text>

        <Text
          style={styles.errorText}
        >
          The selected learning module
          could not be found.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // NO READER CONTENT
  // ==========================================================

  if (
    readerPages.length === 0
  ) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorTitle}
        >
          No Module Content
        </Text>

        <Text
          style={styles.errorText}
        >
          This module does not have any
          learning content yet.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress =
    readerPages.length > 0
      ? (
          (currentPageIndex + 1) /
          readerPages.length
        ) * 100
      : 0;

  const isLastPage =
    currentPageIndex ===
    readerPages.length - 1;

  // ==========================================================
  // PAGE LABEL
  // ==========================================================

  const pageLabel =
    currentPage?.type ===
      "welcome"
      ? "WELCOME"
      : currentPage?.type ===
          "objectives"
        ? "LEARNING OBJECTIVES"
        : currentPage?.type ===
            "section"
          ? `LESSON ${
              currentSection?.sectionNumber ??
              ""
            }`
          : currentPage?.type ===
              "summary"
            ? "MODULE SUMMARY"
            : "KEY TAKEAWAYS";

  // ==========================================================
  // PAGE TITLE
  // ==========================================================

  const pageTitle =
    currentPage?.type ===
      "welcome"
      ? "Welcome to the Module"
      : currentPage?.type ===
          "objectives"
        ? "Learning Objectives"
        : currentPage?.type ===
            "section"
          ? currentSection?.title ??
            "Lesson"
          : currentPage?.type ===
              "summary"
            ? "Module Summary"
            : "Key Takeaways";

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <View
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={styles.header}
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={styles.backButton}
          >
            <Text
              style={styles.backArrow}
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={styles.headerInfo}
          >
            <Text
              style={styles.headerLabel}
            >
              MODULE{" "}
              {moduleIndex + 1}
            </Text>

            <Text
              style={styles.headerTitle}
              numberOfLines={2}
            >
              {currentModule.title}
            </Text>
          </View>

          <View
            style={styles.pageBadge}
          >
            <Text
              style={styles.pageBadgeText}
            >
              {currentPageIndex + 1}/
              {readerPages.length}
            </Text>
          </View>
        </View>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <View
          style={styles.progressArea}
        >
          <View
            style={styles.progressTrack}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text
            style={styles.progressText}
          >
            {Math.round(
              progress,
            )}
            % completed
          </Text>
        </View>

        {/* ==================================================
            MAIN CONTENT CARD
        ================================================== */}

        <View
          style={styles.lessonCard}
        >
          <Text
            style={styles.lessonLabel}
          >
            {pageLabel}
          </Text>

          <Text
            style={styles.lessonTitle}
          >
            {pageTitle}
          </Text>

          <View
            style={styles.divider}
          />

          {/* ==================================================
              WELCOME
          ================================================== */}

          {currentPage?.type ===
            "welcome" && (
            <View>
              <View
                style={
                  styles.introBanner
                }
              >
                <View
                  style={
                    styles.introIcon
                  }
                >
                  <Text
                    style={
                      styles.introIconText
                    }
                  >
                    W
                  </Text>
                </View>

                <View
                  style={
                    styles.introBannerText
                  }
                >
                  <Text
                    style={
                      styles.introBannerTitle
                    }
                  >
                    Welcome
                  </Text>

                  <Text
                    style={
                      styles.introBannerSubtitle
                    }
                  >
                    Let's begin this
                    learning module.
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.lessonContent
                }
              >
                {moduleWelcome}
              </Text>
            </View>
          )}

          {/* ==================================================
              OBJECTIVES
          ================================================== */}

          {currentPage?.type ===
            "objectives" && (
            <View>
              <Text
                style={
                  styles.sectionIntro
                }
              >
                After completing this
                module, you should be able
                to:
              </Text>

              <View
                style={
                  styles.objectivesList
                }
              >
                {learningObjectives.map(
                  (
                    objective,
                    index,
                  ) => (
                    <View
                      key={`objective-${index}`}
                      style={
                        styles.objectiveItem
                      }
                    >
                      <View
                        style={
                          styles.numberCircle
                        }
                      >
                        <Text
                          style={
                            styles.numberText
                          }
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.objectiveText
                        }
                      >
                        {objective}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}

          {/* ==================================================
              SECTION / LESSON
          ================================================== */}

          {currentPage?.type ===
            "section" &&
            currentSection && (
              <View>
                {currentSection.content ? (
                  <Text
                    style={
                      styles.lessonContent
                    }
                  >
                    {
                      currentSection.content
                    }
                  </Text>
                ) : (
                  <Text
                    style={
                      styles.noContent
                    }
                  >
                    No lesson text is
                    available for this
                    section.
                  </Text>
                )}

                {/* ============================================
                    IMAGE
                ============================================ */}

                {shouldRenderImage && (
                  <View
                    style={
                      styles.mediaCard
                    }
                  >
                    <View
                      style={
                        styles.mediaHeader
                      }
                    >
                      <Text
                        style={
                          styles.mediaLabel
                        }
                      >
                        IMAGE
                      </Text>
                    </View>

                    {mediaState.imageError ? (
                      <View
                        style={
                          styles.mediaError
                        }
                      >
                        <Text
                          style={
                            styles.mediaErrorTitle
                          }
                        >
                          Unable to load
                          image
                        </Text>

                        <Text
                          style={
                            styles.mediaErrorText
                          }
                        >
                          The image could
                          not be loaded
                          from
                          Cloudinary.
                        </Text>

                        <Pressable
                          onPress={() => {
                            setMediaState(
                              (
                                current,
                              ) => ({
                                ...current,
                                imageError:
                                  false,
                              }),
                            );
                          }}
                          style={
                            styles.mediaRetryButton
                          }
                        >
                          <Text
                            style={
                              styles.mediaRetryText
                            }
                          >
                            Reload Image
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View
                        style={
                          styles.imageWrapper
                        }
                      >
                        <Image
                          source={{
                            uri: mediaUrl,
                          }}
                          style={
                            styles.lessonImage
                          }
                          resizeMode="contain"
                          onError={(
                            event,
                          ) => {
                            console.log(
                              "IMAGE ERROR:",
                              event
                                .nativeEvent,
                            );

                            setMediaState(
                              (
                                current,
                              ) => ({
                                ...current,
                                imageError:
                                  true,
                              }),
                            );
                          }}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* ============================================
                    YOUTUBE
                ============================================ */}

                {shouldRenderYoutube && (
                  <View
                    style={
                      styles.mediaCard
                    }
                  >
                    <View
                      style={
                        styles.mediaHeader
                      }
                    >
                      <Text
                        style={
                          styles.mediaLabel
                        }
                      >
                        LESSON VIDEO
                      </Text>
                    </View>

                    {mediaState.videoError ? (
                      <View
                        style={
                          styles.mediaError
                        }
                      >
                        <View
                          style={
                            styles.mediaErrorIcon
                          }
                        >
                          <Text
                            style={
                              styles.mediaErrorIconText
                            }
                          >
                            !
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.mediaErrorTitle
                          }
                        >
                          Unable to play
                          video
                        </Text>

                        <Text
                          style={
                            styles.mediaErrorText
                          }
                        >
                          This YouTube
                          video could
                          not be loaded
                          inside the
                          lesson.
                        </Text>

                        <Pressable
                          onPress={() => {
                            setMediaState(
                              (
                                current,
                              ) => ({
                                ...current,
                                videoError:
                                  false,
                              }),
                            );
                          }}
                          style={
                            styles.mediaRetryButton
                          }
                        >
                          <Text
                            style={
                              styles.mediaRetryText
                            }
                          >
                            Reload Video
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View
                        style={
                          styles.videoWrapper
                        }
                      >
                        <YoutubePlayer
                          height={
                            videoHeight
                          }
                          width={
                            videoWidth
                          }
                          videoId={
                            youtubeVideoId!
                          }
                          play={false}
                          forceAndroidAutoplay={
                            false
                          }
                          initialPlayerParams={{
                            controls: true,
                            modestbranding:
                              true,
                            rel: false,
                            playsinline:
                              true,
                          }}
                          onError={(
                            playerError: string,
                          ) => {
                            console.log(
                              "YOUTUBE PLAYER ERROR:",
                              playerError,
                            );

                            setMediaState(
                              (
                                current,
                              ) => ({
                                ...current,
                                videoError:
                                  true,
                              }),
                            );
                          }}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* ============================================
                    NORMAL VIDEO
                ============================================ */}

                {shouldRenderNormalVideo && (
                  <View
                    style={
                      styles.mediaCard
                    }
                  >
                    <View
                      style={
                        styles.mediaHeader
                      }
                    >
                      <Text
                        style={
                          styles.mediaLabel
                        }
                      >
                        VIDEO
                      </Text>
                    </View>

                    <View
                      style={
                        styles.mediaError
                      }
                    >
                      <Text
                        style={
                          styles.mediaErrorTitle
                        }
                      >
                        Video File
                      </Text>

                      <Text
                        style={
                          styles.mediaErrorText
                        }
                      >
                        This lesson
                        contains a
                        video file
                        that is not a
                        YouTube link.
                      </Text>
                    </View>
                  </View>
                )}

                {/* ============================================
                    UNKNOWN MEDIA
                ============================================ */}

                {shouldRenderUnknownMedia && (
                  <View
                    style={
                      styles.mediaCard
                    }
                  >
                    <View
                      style={
                        styles.mediaHeader
                      }
                    >
                      <Text
                        style={
                          styles.mediaLabel
                        }
                      >
                        ADDITIONAL
                        RESOURCE
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.mediaUrl
                      }
                    >
                      {mediaUrl}
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* ==================================================
              SUMMARY
          ================================================== */}

          {currentPage?.type ===
            "summary" && (
            <View>
              <View
                style={
                  styles.summaryBanner
                }
              >
                <Text
                  style={
                    styles.summaryBannerTitle
                  }
                >
                  Module Summary
                </Text>

                <Text
                  style={
                    styles.summaryBannerText
                  }
                >
                  Review the main ideas
                  covered in this module.
                </Text>
              </View>

              <Text
                style={
                  styles.lessonContent
                }
              >
                {moduleSummary}
              </Text>
            </View>
          )}

          {/* ==================================================
              KEY TAKEAWAYS
          ================================================== */}

          {currentPage?.type ===
            "takeaways" && (
            <View>
              <Text
                style={
                  styles.sectionIntro
                }
              >
                Remember these important
                points from the module:
              </Text>

              <View
                style={
                  styles.takeawaysList
                }
              >
                {keyTakeaways.map(
                  (
                    takeaway,
                    index,
                  ) => (
                    <View
                      key={`takeaway-${index}`}
                      style={
                        styles.takeawayItem
                      }
                    >
                      <View
                        style={
                          styles.checkCircle
                        }
                      >
                        <Text
                          style={
                            styles.checkText
                          }
                        >
                          ✓
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.takeawayText
                        }
                      >
                        {takeaway}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}
        </View>

        {/* ==================================================
            READING MESSAGE
        ================================================== */}

        <View
          style={styles.readingCard}
        >
          <View
            style={styles.readingIcon}
          >
            <Text
              style={
                styles.readingIconText
              }
            >
              i
            </Text>
          </View>

          <Text
            style={styles.readingText}
          >
            {currentPage?.type ===
              "takeaways"
              ? "Review the key takeaways before finishing the module."
              : currentPage?.type ===
                  "objectives"
                ? "Understand the learning objectives before continuing."
                : "Read the content carefully before continuing to the next page."}
          </Text>
        </View>
      </ScrollView>

      {/* ====================================================
          BOTTOM NAVIGATION
      ==================================================== */}

      <View
        style={styles.bottomBar}
      >
        <Pressable
          onPress={
            handlePrevious
          }
          disabled={
            currentPageIndex ===
              0 ||
            isCompleting
          }
          style={[
            styles.previousButton,
            (
              currentPageIndex ===
                0 ||
              isCompleting
            ) &&
              styles.disabledButton,
          ]}
        >
          <Text
            style={
              styles.previousArrow
            }
          >
            ←
          </Text>

          <Text
            style={
              styles.previousText
            }
          >
            Previous
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            void handleNext()
          }
          disabled={
            isCompleting
          }
          style={[
            styles.nextButton,
            isCompleting &&
              styles.disabledButton,
          ]}
        >
          <Text
            style={styles.nextText}
          >
            {isCompleting
              ? "Saving..."
              : isLastPage
                ? "Finish Module"
                : "Next"}
          </Text>

          {!isCompleting && (
            <Text
              style={styles.nextArrow}
            >
              →
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    scroll: {
      flex: 1,
    },

    content: {
      margin: 6,
      paddingTop: 22,
      paddingHorizontal: 18,
      paddingBottom: 130,
    },

    // ========================================================
    // HEADER
    // ========================================================

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    backArrow: {
      marginTop: -3,
      fontSize: 28,
      lineHeight: 30,
      color: "#111827",
    },

    headerInfo: {
      flex: 1,
      marginLeft: 11,
    },

    headerLabel: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#94A3B8",
    },

    headerTitle: {
      marginTop: 3,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "800",
      color: "#111827",
    },

    pageBadge: {
      minWidth: 46,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#002B5C",
    },

    pageBadgeText: {
      fontSize: 8,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    // ========================================================
    // PROGRESS
    // ========================================================

    progressArea: {
      marginBottom: 18,
    },

    progressTrack: {
      height: 6,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: "#E2E8F0",
    },

    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#002B5C",
    },

    progressText: {
      marginTop: 6,
      fontSize: 8,
      fontWeight: "700",
      color: "#64748B",
    },

    // ========================================================
    // MAIN CARD
    // ========================================================

    lessonCard: {
      padding: 15,
      borderRadius: 21,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    lessonLabel: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#94A3B8",
    },

    lessonTitle: {
      marginTop: 8,
      fontSize: 23,
      lineHeight: 30,
      fontWeight: "800",
      color: "#111827",
    },

    divider: {
      height: 1,
      marginTop: 17,
      marginBottom: 17,
      backgroundColor: "#E5E7EB",
    },

    lessonContent: {
      fontSize: 13,
      lineHeight: 23,
      color: "#475569",
    },

    noContent: {
      fontSize: 11,
      lineHeight: 18,
      color: "#94A3B8",
    },

    sectionIntro: {
      fontSize: 13,
      lineHeight: 22,
      color: "#475569",
      marginBottom: 18,
    },

    // ========================================================
    // WELCOME
    // ========================================================

    introBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      marginBottom: 18,
      borderRadius: 15,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
    },

    introIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#002B5C",
      marginRight: 11,
    },

    introIconText: {
      fontSize: 13,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    introBannerText: {
      flex: 1,
    },

    introBannerTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: "#002B5C",
    },

    introBannerSubtitle: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 14,
      color: "#64748B",
    },

    // ========================================================
    // OBJECTIVES
    // ========================================================

    objectivesList: {
      gap: 12,
    },

    objectiveItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    numberCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#002B5C",
      marginRight: 10,
    },

    numberText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    objectiveText: {
      flex: 1,
      paddingTop: 4,
      fontSize: 11,
      lineHeight: 18,
      color: "#475569",
    },

    // ========================================================
    // SUMMARY
    // ========================================================

    summaryBanner: {
      padding: 14,
      marginBottom: 18,
      borderRadius: 15,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    summaryBannerTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: "#002B5C",
    },

    summaryBannerText: {
      marginTop: 4,
      fontSize: 9,
      lineHeight: 15,
      color: "#64748B",
    },

    // ========================================================
    // TAKEAWAYS
    // ========================================================

    takeawaysList: {
      gap: 12,
    },

    takeawayItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#002B5C",
      marginRight: 10,
    },

    checkText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    takeawayText: {
      flex: 1,
      paddingTop: 4,
      fontSize: 11,
      lineHeight: 18,
      color: "#475569",
    },

    // ========================================================
    // MEDIA
    // ========================================================

    mediaCard: {
      width: "100%",
      marginTop: 20,
      borderRadius: 13,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      overflow: "hidden",
    },

    mediaHeader: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },

    mediaLabel: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.8,
      color: "#002B5C",
    },

    // ========================================================
    // IMAGE
    // ========================================================

    imageWrapper: {
      width: "100%",
      minHeight: 220,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
    },

    lessonImage: {
      width: "100%",
      height: 320,
      backgroundColor: "#FFFFFF",
    },

    // ========================================================
    // VIDEO
    // ========================================================

    videoWrapper: {
      width: "100%",
      backgroundColor: "#000000",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    // ========================================================
    // MEDIA ERROR
    // ========================================================

    mediaError: {
      paddingVertical: 25,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
    },

    mediaErrorIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F1F5F9",
    },

    mediaErrorIconText: {
      fontSize: 13,
      fontWeight: "900",
      color: "#64748B",
    },

    mediaErrorTitle: {
      marginTop: 9,
      fontSize: 12,
      fontWeight: "800",
      color: "#111827",
      textAlign: "center",
    },

    mediaErrorText: {
      marginTop: 6,
      fontSize: 9,
      lineHeight: 15,
      color: "#64748B",
      textAlign: "center",
    },

    mediaRetryButton: {
      marginTop: 14,
      paddingHorizontal: 15,
      paddingVertical: 9,
      borderRadius: 9,
      backgroundColor: "#002B5C",
    },

    mediaRetryText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    mediaUrl: {
      padding: 12,
      fontSize: 9,
      lineHeight: 15,
      color: "#64748B",
    },

    // ========================================================
    // READING MESSAGE
    // ========================================================

    readingCard: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      padding: 13,
      borderRadius: 15,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
    },

    readingIcon: {
      width: 28,
      height: 28,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#DBEAFE",
      marginRight: 9,
    },

    readingIconText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#2563EB",
    },

    readingText: {
      flex: 1,
      fontSize: 9,
      lineHeight: 15,
      color: "#3B82F6",
    },

    // ========================================================
    // BOTTOM BAR
    // ========================================================

    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingHorizontal: 18,
      paddingTop: 11,
      paddingBottom: 25,
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },

    previousButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 105,
      paddingVertical: 13,
      paddingHorizontal: 13,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    previousArrow: {
      marginRight: 5,
      fontSize: 15,
      color: "#475569",
    },

    previousText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#475569",
    },

    nextButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      borderRadius: 13,
      backgroundColor: "#002B5C",
    },

    nextText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    nextArrow: {
      marginLeft: 7,
      fontSize: 16,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    disabledButton: {
      opacity: 0.4,
    },

    // ========================================================
    // CENTER
    // ========================================================

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
      backgroundColor: "#F8FAFC",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 11,
      color: "#64748B",
    },

    errorTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
      textAlign: "center",
    },

    errorText: {
      marginTop: 6,
      fontSize: 10,
      lineHeight: 16,
      textAlign: "center",
      color: "#64748B",
    },

    retryButton: {
      marginTop: 18,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor: "#002B5C",
    },

    retryText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },
  });