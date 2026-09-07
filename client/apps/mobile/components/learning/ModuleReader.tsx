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
  Dimensions
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

const SCREEN_WIDTH = Dimensions.get("window").width;

const VIDEO_WIDTH = SCREEN_WIDTH - 36 - 40;
const VIDEO_HEIGHT = VIDEO_WIDTH * (9 / 16);

// ============================================================
// YOUTUBE VIDEO ID
// ============================================================

function getYouTubeVideoId(
  url: string,
): string | null {
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    return null;
  }

  // youtu.be/VIDEO_ID
  const shortMatch = cleanUrl.match(
    /youtu\.be\/([^?&#/]+)/i,
  );

  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = cleanUrl.match(
    /youtube\.com\/watch\?[^#]*v=([^&#]+)/i,
  );

  if (watchMatch?.[1]) {
    return watchMatch[1];
  }

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(
    /youtube\.com\/shorts\/([^?&#/]+)/i,
  );

  if (shortsMatch?.[1]) {
    return shortsMatch[1];
  }

  // youtube.com/live/VIDEO_ID
  const liveMatch = cleanUrl.match(
    /youtube\.com\/live\/([^?&#/]+)/i,
  );

  if (liveMatch?.[1]) {
    return liveMatch[1];
  }

  // youtube.com/embed/VIDEO_ID
  const embedMatch = cleanUrl.match(
    /youtube\.com\/embed\/([^?&#/]+)/i,
  );

  if (embedMatch?.[1]) {
    return embedMatch[1];
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
  // CURRENT SECTION
  // ==========================================================

  const [
    currentSectionIndex,
    setCurrentSectionIndex,
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

    /*
     * Important:
     *
     * The hook functions can receive new references
     * on every render.
     *
     * Do NOT put those functions inside the dependency
     * array here because that can cause an infinite loop.
     */
    if (
      loadedKeyRef.current === loadKey
    ) {
      return;
    }

    loadedKeyRef.current = loadKey;

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
        // Errors are handled by the hooks.
      }
    };

    void load();
  }, [
    materialId,
    moduleId,
    reloadKey,
  ]);

  // ==========================================================
  // RESET MEDIA ERROR WHEN SECTION CHANGES
  // ==========================================================

  useEffect(() => {
    setMediaState({
      imageError: false,
      videoError: false,
    });
  }, [
    currentSectionIndex,
  ]);

  // ==========================================================
  // RESUME FIRST UNREAD SECTION
  // ==========================================================

  useEffect(() => {
    if (
      sections.length === 0 ||
      !learningProgress
    ) {
      return;
    }

    const moduleProgress =
      learningProgress.modules.find(
        (module) =>
          module.moduleId === moduleId,
      );

    if (!moduleProgress) {
      return;
    }

    const firstUnreadIndex =
      sections.findIndex(
        (section) =>
          !moduleProgress.sections.some(
            (progressSection) =>
              progressSection.sectionId ===
                section.id &&
              progressSection.isRead,
          ),
      );

    if (firstUnreadIndex >= 0) {
      setCurrentSectionIndex(
        firstUnreadIndex,
      );

      return;
    }

    // All sections are already read.
    // Open the last section.
    setCurrentSectionIndex(
      sections.length - 1,
    );
  }, [
    sections,
    learningProgress,
    moduleId,
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
  // CURRENT SECTION
  // ==========================================================

  const currentSection =
    sections[currentSectionIndex];

  // ==========================================================
  // MEDIA INFORMATION
  // ==========================================================

  const mediaUrl =
    currentSection?.mediaUrl?.trim() ?? "";

  const contentType =
    currentSection?.contentType
      ?.trim()
      .toLowerCase() ?? "";

  const isImage =
    contentType === "image";

  const isVideo =
    contentType === "video";

  const youtubeVideoId =
    isVideo
      ? getYouTubeVideoId(mediaUrl)
      : null;

  // ==========================================================
  // NEXT
  // ==========================================================

  const handleNext =
    async () => {
      if (!currentSection) {
        return;
      }

      // Prevent duplicate requests
      if (isCompleting) {
        return;
      }

      // ------------------------------------------------------
      // SAVE CURRENT SECTION AS READ
      // ------------------------------------------------------

      const savedProgress =
        await completeSection(
          currentSection.id,
        );

      // If saving failed, do not continue.
      if (!savedProgress) {
        return;
      }

      // ------------------------------------------------------
      // NEXT SECTION
      // ------------------------------------------------------

      if (
        currentSectionIndex <
        sections.length - 1
      ) {
        setCurrentSectionIndex(
          (current) =>
            current + 1,
        );

        return;
      }

      // ------------------------------------------------------
      // MODULE FINISHED
      // ------------------------------------------------------

      router.replace({
        pathname:
          "/learning/material",
        params: {
          materialId,
          completedModuleId:
            moduleId,
        },
      });
    };

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  const handlePrevious =
    () => {
      if (
        currentSectionIndex === 0
      ) {
        return;
      }

      setCurrentSectionIndex(
        (current) =>
          current - 1,
      );
    };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry =
    () => {
      loadedKeyRef.current = null;

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
          color="#111827"
        />

        <Text
          style={styles.loadingText}
        >
          Loading lesson...
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
          Unable to Load Lesson
        </Text>

        <Text
          style={styles.errorText}
        >
          {error.message}
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
  // NO CONTENT
  // ==========================================================

  if (!currentSection) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorTitle}
        >
          No Lesson Content
        </Text>

        <Text
          style={styles.errorText}
        >
          This module does not have any
          sections yet.
        </Text>
      </View>
    );
  }

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress =
    sections.length > 0
      ? (
          (currentSectionIndex + 1) /
          sections.length
        ) * 100
      : 0;

  const isLastSection =
    currentSectionIndex ===
    sections.length - 1;

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
              MODULE {moduleIndex + 1}
            </Text>

            <Text
              style={styles.headerTitle}
              numberOfLines={2}
            >
              {currentModule?.title}
            </Text>
          </View>

          <View
            style={styles.pageBadge}
          >
            <Text
              style={styles.pageBadgeText}
            >
              {currentSectionIndex + 1}/
              {sections.length}
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
            {Math.round(progress)}% completed
          </Text>
        </View>

        {/* ==================================================
            LESSON
        ================================================== */}

        <View
          style={styles.lessonCard}
        >
          <Text
            style={styles.lessonLabel}
          >
            LESSON{" "}
            {currentSection.sectionNumber}
          </Text>

          <Text
            style={styles.lessonTitle}
          >
            {currentSection.title}
          </Text>

          <View
            style={styles.divider}
          />

          {currentSection.content ? (
            <Text
              style={styles.lessonContent}
            >
              {currentSection.content}
            </Text>
          ) : (
            <Text
              style={styles.noContent}
            >
              No lesson text is available
              for this section.
            </Text>
          )}

          {/* ==================================================
              IMAGE
          ================================================== */}

          {isImage &&
            mediaUrl && (
              <View
                style={styles.mediaCard}
              >
                <Text
                  style={styles.mediaLabel}
                >
                  LESSON IMAGE
                </Text>

                {mediaState.imageError ? (
                  <View
                    style={styles.mediaError}
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
                      Unable to load image
                    </Text>

                    <Text
                      style={
                        styles.mediaErrorText
                      }
                    >
                      The lesson image could not
                      be loaded.
                    </Text>
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
                      onError={() => {
                        setMediaState(
                          (current) => ({
                            ...current,
                            imageError: true,
                          }),
                        );
                      }}
                    />
                  </View>
                )}
              </View>
            )}

          {/* ==================================================
              VIDEO
          ================================================== */}

          {isVideo &&
            mediaUrl && (
              <View
                style={styles.mediaCard}
              >
                <View
                  style={styles.mediaHeader}
                >
                  <Text
                    style={styles.mediaLabel}
                  >
                    LESSON VIDEO
                  </Text>
                </View>

                {mediaState.videoError ? (
                  <View
                    style={styles.mediaError}
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
                      Unable to play video
                    </Text>

                    <Text
                      style={
                        styles.mediaErrorText
                      }
                    >
                      This YouTube video cannot
                      be played inside the lesson.
                    </Text>
                  </View>
                ) : youtubeVideoId ? (
                  <View
                    style={
                      styles.videoWrapper
                    }
                  >
                  <YoutubePlayer
  height={VIDEO_HEIGHT}
  width={VIDEO_WIDTH}
  videoId={youtubeVideoId}
  play={false}
  onError={(playerError: any) => {
    console.log(
      "YouTube player error:",
      playerError,
    );

    setMediaState((current) => ({
      ...current,
      videoError: true,
    }));
  }}
  initialPlayerParams={{
    controls: true,
    modestbranding: true,
    rel: false,
  }}
/>
                  </View>
                ) : (
                  <View
                    style={styles.mediaError}
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
                      Invalid YouTube Video
                    </Text>

                    <Text
                      style={
                        styles.mediaErrorText
                      }
                    >
                      The video link provided by
                      the learning material is
                      invalid.
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* ==================================================
              UNKNOWN MEDIA TYPE
          ================================================== */}

          {!isImage &&
            !isVideo &&
            mediaUrl && (
              <View
                style={styles.mediaCard}
              >
                <Text
                  style={styles.mediaLabel}
                >
                  ADDITIONAL RESOURCE
                </Text>

                <Text
                  style={styles.mediaUrl}
                >
                  {mediaUrl}
                </Text>
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
              style={styles.readingIconText}
            >
              i
            </Text>
          </View>

          <Text
            style={styles.readingText}
          >
            Read the lesson carefully before
            continuing to the next page.
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
          onPress={handlePrevious}
          disabled={
            currentSectionIndex === 0 ||
            isCompleting
          }
          style={[
            styles.previousButton,
            (
              currentSectionIndex === 0 ||
              isCompleting
            ) &&
              styles.disabledButton,
          ]}
        >
          <Text
            style={styles.previousArrow}
          >
            ←
          </Text>

          <Text
            style={styles.previousText}
          >
            Previous
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            void handleNext()
          }
          disabled={isCompleting}
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
              : isLastSection
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

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
    backgroundColor: "#111827",
  },

  pageBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // ==========================================================
  // PROGRESS
  // ==========================================================

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
    backgroundColor: "#111827",
  },

  progressText: {
    marginTop: 6,
    fontSize: 8,
    fontWeight: "700",
    color: "#64748B",
  },

  // ==========================================================
  // LESSON
  // ==========================================================

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

  // ==========================================================
  // MEDIA
  // ==========================================================

  mediaCard: {
    marginTop: 20,
    padding: 3,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  mediaHeader: {
    margin: 10,
  },

  mediaLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  mediaUrl: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 15,
    color: "#475569",
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageWrapper: {
    width: "100%",
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  lessonImage: {
    width: "100%",
    height: 240,
  },

  // ==========================================================
  // VIDEO
  // ==========================================================

 videoWrapper: {
  width: "100%",
  marginTop: 1,
  borderRadius: 10,
  overflow: "hidden",
  backgroundColor: "#000000",
  alignItems: "center",
},

  // ==========================================================
  // MEDIA ERROR
  // ==========================================================

  mediaError: {
    marginTop: 10,
    paddingVertical: 22,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  mediaErrorText: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 15,
    color: "#64748B",
    textAlign: "center",
  },

  // ==========================================================
  // READING
  // ==========================================================

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

  // ==========================================================
  // BOTTOM BAR
  // ==========================================================

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
    backgroundColor: "#111827",
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

  // ==========================================================
  // CENTER
  // ==========================================================

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
    backgroundColor: "#111827",
  },

  retryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});