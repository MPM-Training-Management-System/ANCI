import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as ImageManipulator from "expo-image-manipulator";

import Ionicons from "@expo/vector-icons/Ionicons";

// ======================================================
// VALID ID TYPES
// ======================================================

export const VALID_ID_TYPES = [
  "Philippine Passport",
  "Driver's License",
  "National ID (PhilID)",
  "UMID",
  "PhilHealth ID",
  "Postal ID",
  "PRC ID",
  "TIN ID",
  "Voter's ID",
  "Senior Citizen ID",
  "PWD ID",
  "School ID",
] as const;

export type ValidIdType =
  (typeof VALID_ID_TYPES)[number];

// ======================================================
// FILE RESULT
// ======================================================

export type ValidIdFile = {
  uri: string;
  name: string;
  type: string;
  idType: ValidIdType;
};

// ======================================================
// PROPS
// ======================================================

interface Props {
  value?: ValidIdFile | null;

  onChange: (
    file: ValidIdFile | null
  ) => void;

  disabled?: boolean;
}

// ======================================================
// COMPONENT
// ======================================================

export default function ValidIdPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  // ----------------------------------------------------
  // CAMERA
  // ----------------------------------------------------

  const cameraRef =
    useRef<CameraView | null>(null);

  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  const [
    selectedIdType,
    setSelectedIdType,
  ] = useState<ValidIdType | null>(
    value?.idType ?? null
  );

  const [
    showIdTypes,
    setShowIdTypes,
  ] = useState(false);

  const [
    showCamera,
    setShowCamera,
  ] = useState(false);

  const [
    capturedUri,
    setCapturedUri,
  ] = useState<string | null>(null);

  const [
    isCapturing,
    setIsCapturing,
  ] = useState(false);

  const [
    checkingQuality,
    setCheckingQuality,
  ] = useState(false);

  // ====================================================
  // IMPORTANT
  // CAMERA PREVIEW SIZE
  // ====================================================

  const [
    cameraSize,
    setCameraSize,
  ] = useState({
    width: 0,
    height: 0,
  });

  // ====================================================
  // SYNC VALUE
  // ====================================================

  useEffect(() => {
    if (value) {
      setSelectedIdType(value.idType);
    }
  }, [value]);

  // ====================================================
  // SELECT ID TYPE
  // ====================================================

  const handleSelectIdType = (
    idType: ValidIdType
  ) => {
    setSelectedIdType(idType);
    setShowIdTypes(false);

    // If user changes ID type,
    // remove previous captured ID.
    if (value) {
      onChange(null);
    }

    setCapturedUri(null);
  };

  // ====================================================
  // OPEN CAMERA
  // ====================================================

  const handleOpenCamera = async () => {
    if (disabled) {
      return;
    }

    if (!selectedIdType) {
      Alert.alert(
        "Select ID Type",
        "Please select the type of valid ID you will upload."
      );

      return;
    }

    if (!permission?.granted) {
      const result =
        await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is required to capture your valid ID."
        );

        return;
      }
    }

    // Reset crop dimensions
    setCameraSize({
      width: 0,
      height: 0,
    });

    setCapturedUri(null);
    setShowCamera(true);
  };

  // ====================================================
  // CLOSE CAMERA
  // ====================================================

  const handleCloseCamera = () => {
    if (isCapturing) {
      return;
    }

    setShowCamera(false);
    setCapturedUri(null);

    setCameraSize({
      width: 0,
      height: 0,
    });
  };

  // ====================================================
  // CROP PHOTO
  // ====================================================

  const cropCapturedImage = async (
    uri: string
  ): Promise<string> => {
    /*
     * If camera dimensions are not ready,
     * return the original image.
     */

    if (
      cameraSize.width <= 0 ||
      cameraSize.height <= 0
    ) {
      console.warn(
        "Camera size is not ready. Using original image."
      );

      return uri;
    }

    try {
      // ==================================================
      // GET ORIGINAL IMAGE DIMENSIONS
      // ==================================================

      const imageInfo =
        await ImageManipulator.manipulateAsync(
          uri,
          [],
          {
            compress: 1,
            format:
              ImageManipulator.SaveFormat.JPEG,
          }
        );

      const imageWidth =
        imageInfo.width;

      const imageHeight =
        imageInfo.height;

      // ==================================================
      // GUIDE FRAME
      //
      // Must match styles.guideContainer
      // and styles.guideFrame.
      //
      // left: 20
      // right: 20
      // top: 28%
      // aspectRatio: 1.58
      // ==================================================

      const frameLeft = 20;

      const frameWidth =
        cameraSize.width - 40;

      const frameHeight =
        frameWidth / 1.58;

      const frameTop =
        cameraSize.height * 0.28;

      // ==================================================
      // CAMERA / IMAGE ASPECT RATIO
      // ==================================================

      const cameraAspect =
        cameraSize.width /
        cameraSize.height;

      const imageAspect =
        imageWidth /
        imageHeight;

      let scale = 1;

      let offsetX = 0;

      let offsetY = 0;

      /*
       * Camera preview behaves like a cover.
       *
       * We calculate which portion of the actual
       * image is visible inside the camera preview.
       */

      if (imageAspect > cameraAspect) {
        // Image is wider than preview.

        scale =
          imageHeight /
          cameraSize.height;

        const displayedWidth =
          imageWidth / scale;

        offsetX =
          (displayedWidth -
            cameraSize.width) /
          2;
      } else {
        // Image is taller than preview.

        scale =
          imageWidth /
          cameraSize.width;

        const displayedHeight =
          imageHeight / scale;

        offsetY =
          (displayedHeight -
            cameraSize.height) /
          2;
      }

      // ==================================================
      // CONVERT FRAME TO IMAGE COORDINATES
      // ==================================================

      const cropOriginX =
        Math.max(
          0,
          Math.round(
            (frameLeft + offsetX) *
              scale
          )
        );

      const cropOriginY =
        Math.max(
          0,
          Math.round(
            (frameTop + offsetY) *
              scale
          )
        );

      const cropWidth =
        Math.min(
          imageWidth -
            cropOriginX,
          Math.round(
            frameWidth * scale
          )
        );

      const cropHeight =
        Math.min(
          imageHeight -
            cropOriginY,
          Math.round(
            frameHeight * scale
          )
        );

      // ==================================================
      // SAFETY CHECK
      // ==================================================

      if (
        cropWidth <= 0 ||
        cropHeight <= 0
      ) {
        console.warn(
          "Invalid crop dimensions. Using original image."
        );

        return uri;
      }

      // ==================================================
      // DEBUG
      // ==================================================

      console.log(
        "================================"
      );

      console.log(
        "VALID ID CROP"
      );

      console.log({
        imageWidth,
        imageHeight,

        cameraWidth:
          cameraSize.width,

        cameraHeight:
          cameraSize.height,

        frameLeft,
        frameTop,
        frameWidth,
        frameHeight,

        cropOriginX,
        cropOriginY,
        cropWidth,
        cropHeight,
      });

      console.log(
        "================================"
      );

      // ==================================================
      // ACTUAL IMAGE CROP
      // ==================================================

      const cropped =
        await ImageManipulator.manipulateAsync(
          uri,
          [
            {
              crop: {
                originX:
                  cropOriginX,

                originY:
                  cropOriginY,

                width:
                  cropWidth,

                height:
                  cropHeight,
              },
            },
          ],
          {
            compress: 0.95,

            format:
              ImageManipulator.SaveFormat.JPEG,
          }
        );

      return cropped.uri;
    } catch (error) {
      console.error(
        "VALID ID CROP ERROR:",
        error
      );

      // Never lose the original photo
      // if cropping fails.

      return uri;
    }
  };

  // ====================================================
  // CAPTURE PHOTO
  // ====================================================

  const handleCapture = async () => {
    if (
      !cameraRef.current ||
      isCapturing
    ) {
      return;
    }

    try {
      setIsCapturing(true);

      // ==================================================
      // CAPTURE ORIGINAL IMAGE
      // ==================================================

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 1,
          skipProcessing: false,
        });

      if (!photo?.uri) {
        Alert.alert(
          "Capture Error",
          "Unable to capture the valid ID."
        );

        return;
      }

      console.log(
        "ORIGINAL PHOTO:",
        photo.uri
      );

      // ==================================================
      // CROP USING GUIDE FRAME
      // ==================================================

      const croppedUri =
        await cropCapturedImage(
          photo.uri
        );

      console.log(
        "CROPPED PHOTO:",
        croppedUri
      );

      // ==================================================
      // SAVE CROPPED IMAGE FOR REVIEW
      // ==================================================

      setCapturedUri(
        croppedUri
      );
    } catch (error) {
      console.error(
        "VALID ID CAPTURE ERROR:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to capture the valid ID. Please try again."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  // ====================================================
  // RETAKE
  // ====================================================

  const handleRetake = () => {
    setCapturedUri(null);

    // Keep camera size because the
    // camera layout is still the same.
  };

  // ====================================================
  // BASIC IMAGE QUALITY CHECK
  // ====================================================

  /*
   * Important:
   *
   * This is currently only a basic placeholder.
   *
   * A real blur/sharpness detector can be added
   * later using computer vision.
   */

  const checkImageQuality = async (
    uri: string
  ): Promise<boolean> => {
    return Boolean(uri);
  };

  // ====================================================
  // USE PHOTO
  // ====================================================

  const handleUsePhoto = async () => {
    if (
      !capturedUri ||
      !selectedIdType
    ) {
      return;
    }

    try {
      setCheckingQuality(true);

      const isGood =
        await checkImageQuality(
          capturedUri
        );

      if (!isGood) {
        Alert.alert(
          "Photo Too Blurry",
          "Your valid ID photo is too blurry or unclear. Please retake the photo."
        );

        return;
      }

      // ==================================================
      // CREATE FILE
      // ==================================================

      const file: ValidIdFile = {
        uri: capturedUri,

        name:
          `valid-id-${Date.now()}.jpg`,

        type: "image/jpeg",

        idType:
          selectedIdType,
      };

      console.log(
        "VALID ID FILE:",
        file
      );

      // ==================================================
      // SEND TO PARENT
      // ==================================================

      onChange(file);

      setShowCamera(false);

      setCapturedUri(null);

    } catch (error) {
      console.error(
        "VALID ID QUALITY CHECK ERROR:",
        error
      );

      Alert.alert(
        "Photo Error",
        "Unable to verify the photo. Please try again."
      );
    } finally {
      setCheckingQuality(false);
    }
  };

  // ====================================================
  // REMOVE
  // ====================================================

  const handleRemove = () => {
    if (disabled) {
      return;
    }

    setCapturedUri(null);

    onChange(null);
  };

  // ====================================================
  // CAMERA SCREEN
  // ====================================================

  const renderCamera = () => {
    if (!showCamera) {
      return null;
    }

    return (
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={
          handleCloseCamera
        }
      >
        <View
          style={
            styles.cameraContainer
          }
        >
          {/* ==========================================
              CAMERA
          ========================================== */}

          {!capturedUri ? (
            <CameraView
              ref={cameraRef}
              style={
                StyleSheet.absoluteFill
              }
              facing="back"

              // IMPORTANT:
              // Get actual camera preview
              // dimensions.

              onLayout={(event) => {
                const {
                  width,
                  height,
                } =
                  event.nativeEvent.layout;

                setCameraSize({
                  width,
                  height,
                });

                console.log(
                  "CAMERA SIZE:",
                  {
                    width,
                    height,
                  }
                );
              }}
            />
          ) : (
            <Image
              source={{
                uri: capturedUri,
              }}
              style={
                StyleSheet.absoluteFill
              }
              resizeMode="contain"
            />
          )}

          {/* ==========================================
              CAMERA HEADER
          ========================================== */}

          <View
            style={
              styles.cameraHeader
            }
          >
            <Pressable
              onPress={
                capturedUri
                  ? handleRetake
                  : handleCloseCamera
              }
              style={
                styles.backButton
              }
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>

            <View
              style={
                styles.cameraHeaderText
              }
            >
              <Text
                style={
                  styles.cameraTitle
                }
              >
                {capturedUri
                  ? "Review Valid ID"
                  : "Scan Valid ID"}
              </Text>

              <Text
                style={
                  styles.cameraSubtitle
                }
              >
                {selectedIdType}
              </Text>
            </View>
          </View>

          {/* ==========================================
              GUIDE FRAME
          ========================================== */}

          {!capturedUri && (
            <View
              pointerEvents="none"
              style={
                styles.guideContainer
              }
            >
              <View
                style={
                  styles.guideFrame
                }
              >
                {/* TOP LEFT */}

                <View
                  style={[
                    styles.corner,
                    styles.topLeft,
                  ]}
                />

                {/* TOP RIGHT */}

                <View
                  style={[
                    styles.corner,
                    styles.topRight,
                  ]}
                />

                {/* BOTTOM LEFT */}

                <View
                  style={[
                    styles.corner,
                    styles.bottomLeft,
                  ]}
                />

                {/* BOTTOM RIGHT */}

                <View
                  style={[
                    styles.corner,
                    styles.bottomRight,
                  ]}
                />
              </View>

              <Text
                style={
                  styles.guideText
                }
              >
                Place the entire ID inside the frame
              </Text>

              <Text
                style={
                  styles.guideSubtext
                }
              >
                Make sure the ID is flat, well-lit,
                and clearly visible.
              </Text>
            </View>
          )}

          {/* ==========================================
              CAPTURE / REVIEW ACTIONS
          ========================================== */}

          <View
            style={
              styles.cameraBottom
            }
          >
            {!capturedUri ? (
              <>
                <Text
                  style={
                    styles.cameraInstruction
                  }
                >
                  Avoid glare and shadows
                </Text>

                <Pressable
                  onPress={
                    handleCapture
                  }
                  disabled={
                    isCapturing
                  }
                  style={
                    styles.captureButton
                  }
                >
                  {isCapturing ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <View
                      style={
                        styles.captureInner
                      }
                    />
                  )}
                </Pressable>
              </>
            ) : (
              <View
                style={
                  styles.reviewActions
                }
              >
                <Pressable
                  onPress={
                    handleRetake
                  }
                  style={
                    styles.retakeButton
                  }
                >
                  <Ionicons
                    name="camera-reverse-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.retakeText
                    }
                  >
                    Retake
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    handleUsePhoto
                  }
                  disabled={
                    checkingQuality
                  }
                  style={
                    styles.usePhotoButton
                  }
                >
                  {checkingQuality ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.usePhotoText
                        }
                      >
                        Use Photo
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <View
      style={styles.container}
    >
      {/* ==========================================
          LABEL
      ========================================== */}

      <Text
        style={styles.label}
      >
        Valid ID
      </Text>

      <Text
        style={styles.description}
      >
        Select one accepted ID and take a clear photo
        of the original document.
      </Text>

      {/* ==========================================
          ID TYPE SELECTOR
      ========================================== */}

      <Pressable
        onPress={() =>
          setShowIdTypes(true)
        }
        disabled={disabled}
        style={[
          styles.selectButton,
          disabled &&
            styles.disabled,
        ]}
      >
        <View
          style={styles.selectLeft}
        >
          <View
            style={styles.idIcon}
          >
            <Ionicons
              name="id-card-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.selectTextContainer
            }
          >
            <Text
              style={
                styles.selectLabel
              }
            >
              ID Type
            </Text>

            <Text
              style={
                styles.selectValue
              }
              numberOfLines={1}
            >
              {selectedIdType ??
                "Select a valid ID"}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-down"
          size={20}
          color="#64748B"
        />
      </Pressable>

      {/* ==========================================
          ACCEPTED IDs
      ========================================== */}

      <View
        style={
          styles.acceptedContainer
        }
      >
        <View
          style={
            styles.acceptedHeader
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color="#16A34A"
          />

          <Text
            style={
              styles.acceptedTitle
            }
          >
            Accepted IDs
          </Text>
        </View>

        <View
          style={styles.idList}
        >
          {VALID_ID_TYPES.map(
            (idType) => (
              <View
                key={idType}
                style={
                  styles.idItem
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#16A34A"
                />

                <Text
                  style={
                    styles.idItemText
                  }
                >
                  {idType}
                </Text>
              </View>
            )
          )}
        </View>
      </View>

      {/* ==========================================
          CAPTURED FILE
      ========================================== */}

      {value ? (
        <View
          style={
            styles.selectedCard
          }
        >
          <Image
            source={{
              uri: value.uri,
            }}
            style={
              styles.preview
            }
            resizeMode="contain"
          />

          <View
            style={
              styles.selectedInfo
            }
          >
            <Text
              style={
                styles.selectedTitle
              }
              numberOfLines={1}
            >
              {value.idType}
            </Text>

            <Text
              style={
                styles.selectedStatus
              }
            >
              Valid ID captured ✓
            </Text>
          </View>

          <Pressable
            onPress={
              handleRemove
            }
            disabled={disabled}
            style={
              styles.removeButton
            }
          >
            <Ionicons
              name="close"
              size={20}
              color="#64748B"
            />
          </Pressable>
        </View>
      ) : (
        /* ==========================================
            SCAN BUTTON
        ========================================== */

        <Pressable
          onPress={
            handleOpenCamera
          }
          disabled={
            disabled ||
            !selectedIdType
          }
          style={[
            styles.scanButton,

            (!selectedIdType ||
              disabled) &&
              styles.scanButtonDisabled,
          ]}
        >
          <View
            style={
              styles.scanIcon
            }
          >
            <Ionicons
              name="camera-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.scanContent
            }
          >
            <Text
              style={
                styles.scanTitle
              }
            >
              Scan Valid ID
            </Text>

            <Text
              style={
                styles.scanSubtitle
              }
            >
              Take a clear photo using your camera
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      )}

      {/* ==========================================
          ID TYPE MODAL
      ========================================== */}

      <Modal
        visible={showIdTypes}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowIdTypes(false)
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContainer
            }
          >
            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Select Valid ID
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose the ID you will present
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setShowIdTypes(false)
                }
                style={
                  styles.modalClose
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#475569"
                />
              </Pressable>
            </View>

            {/* ID LIST */}

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.modalList
              }
            >
              {VALID_ID_TYPES.map(
                (idType) => {
                  const selected =
                    selectedIdType ===
                    idType;

                  return (
                    <Pressable
                      key={idType}
                      onPress={() =>
                        handleSelectIdType(
                          idType
                        )
                      }
                      style={[
                        styles.idOption,
                        selected &&
                          styles.idOptionSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        <Ionicons
                          name="card-outline"
                          size={20}
                          color={
                            selected
                              ? "#FFFFFF"
                              : "#2563EB"
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {idType}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#2563EB"
                        />
                      )}
                    </Pressable>
                  );
                }
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CAMERA MODAL */}

      {renderCamera()}
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    marginBottom: 14,
  },

  // ====================================================
  // SELECT
  // ====================================================

  selectButton: {
    width: "100%",
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  idIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  selectTextContainer: {
    flex: 1,
  },

  selectLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  selectValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  disabled: {
    opacity: 0.5,
  },

  // ====================================================
  // ACCEPTED IDS
  // ====================================================

  acceptedContainer: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  acceptedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  acceptedTitle: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },

  idList: {
    gap: 7,
  },

  idItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  idItemText: {
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 17,
    color: "#365314",
  },

  // ====================================================
  // SCAN BUTTON
  // ====================================================

  scanButton: {
    marginTop: 14,
    minHeight: 72,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
  },

  scanButtonDisabled: {
    opacity: 0.45,
  },

  scanIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  scanContent: {
    flex: 1,
  },

  scanTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  scanSubtitle: {
    color: "#DBEAFE",
    fontSize: 12,
  },

  // ====================================================
  // SELECTED
  // ====================================================

  selectedCard: {
    marginTop: 14,
    minHeight: 82,
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  preview: {
    width: 64,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },

  selectedInfo: {
    flex: 1,
    marginLeft: 12,
  },

  selectedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  selectedStatus: {
    marginTop: 4,
    fontSize: 12,
    color: "#16A34A",
  },

  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // ====================================================
  // ID TYPE MODAL
  // ====================================================

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15,23,42,0.55)",
  },

  modalContainer: {
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  modalList: {
    paddingBottom: 10,
    gap: 8,
  },

  idOption: {
    minHeight: 58,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  idOptionSelected: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  optionIconSelected: {
    backgroundColor: "#2563EB",
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  optionTextSelected: {
    color: "#1D4ED8",
  },

  // ====================================================
  // CAMERA
  // ====================================================

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  cameraHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(0,0,0,0.45)",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  cameraHeaderText: {
    marginLeft: 12,
    flex: 1,
  },

  cameraTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  cameraSubtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 2,
  },

  // ====================================================
  // GUIDE
  // ====================================================

  guideContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "28%",
    alignItems: "center",
  },

  guideFrame: {
    width: "100%",
    aspectRatio: 1.58,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.35)",
    borderRadius: 12,
  },

  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },

  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },

  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },

  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },

  guideText: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  guideSubtext: {
    marginTop: 6,
    maxWidth: 320,
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  // ====================================================
  // CAMERA BOTTOM
  // ====================================================

  cameraBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 170,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(0,0,0,0.45)",
  },

  cameraInstruction: {
    color: "#E2E8F0",
    fontSize: 12,
    marginBottom: 15,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
  },

  // ====================================================
  // REVIEW
  // ====================================================

  reviewActions: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  retakeButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  retakeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  usePhotoButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  usePhotoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});