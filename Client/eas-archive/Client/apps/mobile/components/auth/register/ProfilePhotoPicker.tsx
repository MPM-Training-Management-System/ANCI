import {
  useRef,
  useState,
} from "react";

import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import * as ImagePicker from "expo-image-picker";

import Ionicons from "@expo/vector-icons/Ionicons";

interface Props {
  value?: string;
  onChange: (uri: string) => void;
  disabled?: boolean;
}

type FlashMode =
  | "off"
  | "on"
  | "auto";

export default function ProfilePhotoPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  // =====================================================
  // CAMERA PERMISSION
  // =====================================================

  const [permission, requestPermission] =
    useCameraPermissions();

  // =====================================================
  // CAMERA STATE
  // =====================================================

  const [cameraVisible, setCameraVisible] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [takingPhoto, setTakingPhoto] =
    useState(false);

  // =====================================================
  // FLASH
  // =====================================================

  const [flash, setFlash] =
    useState<FlashMode>("auto");

  // =====================================================
  // GALLERY STATE
  // =====================================================

  const [pickingImage, setPickingImage] =
    useState(false);

  // =====================================================
  // CAMERA REF
  // =====================================================

  const cameraRef =
    useRef<CameraView | null>(null);

  // =====================================================
  // OPEN CAMERA
  // =====================================================

  const handleOpenCamera = async () => {
    if (disabled || takingPhoto) {
      return;
    }

    try {
      if (!permission) {
        return;
      }

      // Request camera permission
      if (!permission.granted) {
        const result =
          await requestPermission();

        if (!result.granted) {
          Alert.alert(
            "Camera Permission Required",
            "Please allow camera access to take your profile photo."
          );

          return;
        }
      }

      setCameraReady(false);
      setCameraVisible(true);
    } catch (error) {
      console.error(
        "OPEN CAMERA ERROR:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  };

  // =====================================================
  // OPEN GALLERY
  // =====================================================

  const handleOpenGallery = async () => {
    if (
      disabled ||
      pickingImage ||
      takingPhoto
    ) {
      return;
    }

    try {
      setPickingImage(true);

      // =================================================
      // REQUEST PHOTO LIBRARY PERMISSION
      // =================================================

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Photo Permission Required",
          "Please allow access to your photos so you can choose a profile picture."
        );

        return;
      }

      // =================================================
      // OPEN PHOTO LIBRARY
      // =================================================

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.85,

          selectionLimit: 1,
        });

      // =================================================
      // USER CANCELLED
      // =================================================

      if (result.canceled) {
        return;
      }

      // =================================================
      // GET SELECTED IMAGE
      // =================================================

      const selectedAsset =
        result.assets?.[0];

      if (!selectedAsset?.uri) {
        Alert.alert(
          "Photo Error",
          "Unable to get the selected photo."
        );

        return;
      }

      console.log(
        "GALLERY PHOTO:",
        selectedAsset.uri
      );

      console.log(
        "PHOTO SIZE:",
        selectedAsset.width,
        "x",
        selectedAsset.height
      );

      // =================================================
      // SEND IMAGE TO PARENT
      // =================================================

      onChange(
        selectedAsset.uri
      );
    } catch (error) {
      console.error(
        "OPEN GALLERY ERROR:",
        error
      );

      Alert.alert(
        "Photo Error",
        "Unable to select a photo from your gallery."
      );
    } finally {
      setPickingImage(false);
    }
  };

  // =====================================================
  // CLOSE CAMERA
  // =====================================================

  const handleCloseCamera = () => {
    if (takingPhoto) {
      return;
    }

    setCameraVisible(false);
    setCameraReady(false);
  };

  // =====================================================
  // TOGGLE FLASH
  // =====================================================

  const handleToggleFlash = () => {
  setFlash((current) => {
    if (current === "auto") {
      return "on";
    }

    if (current === "on") {
      return "off";
    }

    return "auto";
  });
};

  // =====================================================
  // FLASH LABEL
  // =====================================================

  const getFlashLabel = () => {
  if (flash === "auto") {
    return "AUTO";
  }

  if (flash === "on") {
    return "ON";
  }

  return "OFF";
};

  // =====================================================
  // TAKE PHOTO
  // =====================================================

  const handleTakePhoto = async () => {
    if (
      !cameraRef.current ||
      !cameraReady ||
      takingPhoto
    ) {
      return;
    }

    try {
      setTakingPhoto(true);

      console.log(
        "================================"
      );

      console.log(
        "TAKING PROFILE PHOTO"
      );

      console.log(
        "FLASH:",
        flash
      );

      // =================================================
      // TAKE PHOTO
      // =================================================

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.85,

          skipProcessing: false,
        });

      // =================================================
      // VALIDATE
      // =================================================

      if (!photo?.uri) {
        Alert.alert(
          "Camera Error",
          "Unable to capture the photo."
        );

        return;
      }

      console.log(
        "PROFILE PHOTO URI:",
        photo.uri
      );

      console.log(
        "PHOTO SIZE:",
        photo.width,
        "x",
        photo.height
      );

      // =================================================
      // SEND TO PARENT
      // =================================================

      onChange(photo.uri);

      // =================================================
      // CLOSE CAMERA
      // =================================================

      setCameraVisible(false);
      setCameraReady(false);
    } catch (error) {
      console.error(
        "TAKE PHOTO ERROR:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to take your profile photo. Please try again."
      );
    } finally {
      setTakingPhoto(false);
    }
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <View style={styles.container}>

      {/* =================================================
          LABEL
      ================================================= */}

      <Text style={styles.label}>
        Profile Photo
      </Text>

      {/* =================================================
          PHOTO SECTION
      ================================================= */}

      <View style={styles.photoSection}>

        {/* =================================================
            PHOTO PREVIEW
        ================================================= */}

        <View
          style={styles.avatarContainer}
        >
          {value ? (
            <Image
              source={{
                uri: value,
              }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={styles.placeholder}
            >
              <Ionicons
                name="person-outline"
                size={52}
                color="#94A3B8"
              />
            </View>
          )}
        </View>

        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.title}>
          {value
            ? "Profile photo added"
            : "Add your profile photo"}
        </Text>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Text
          style={styles.description}
        >
          {value
            ? "Make sure your face is clearly visible in the photo."
            : "Take a clear photo or choose an existing photo from your gallery."}
        </Text>

        {/* =================================================
            TAKE PHOTO
        ================================================= */}

        <Pressable
          disabled={
            disabled ||
            pickingImage
          }
          onPress={
            handleOpenCamera
          }
          style={[
            styles.optionButton,
            styles.cameraButton,
            (disabled ||
              pickingImage) &&
              styles.buttonDisabled,
          ]}
        >
          <View
            style={styles.buttonIcon}
          >
            <Ionicons
              name="camera-outline"
              size={21}
              color="#FFFFFF"
            />
          </View>

          <View
            style={styles.buttonContent}
          >
            <Text
              style={
                styles.optionButtonTitle
              }
            >
              {value
                ? "Retake Photo"
                : "Take Profile Photo"}
            </Text>

            <Text
              style={
                styles.optionButtonSubtitle
              }
            >
              Use your camera
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

        {/* =================================================
            GALLERY
        ================================================= */}

        <Pressable
          disabled={
            disabled ||
            pickingImage
          }
          onPress={
            handleOpenGallery
          }
          style={[
            styles.optionButton,
            styles.galleryButton,
            (disabled ||
              pickingImage) &&
              styles.buttonDisabled,
          ]}
        >
          <View
            style={
              styles.galleryIcon
            }
          >
            <Ionicons
              name="images-outline"
              size={21}
              color="#2563EB"
            />
          </View>

          <View
            style={styles.buttonContent}
          >
            <Text
              style={
                styles.galleryButtonTitle
              }
            >
              {pickingImage
                ? "Opening Gallery..."
                : "Choose from Gallery"}
            </Text>

            <Text
              style={
                styles.galleryButtonSubtitle
              }
            >
              Select an existing photo
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#2563EB"
          />
        </Pressable>

      </View>

      {/* =================================================
          FULL SCREEN CAMERA
      ================================================= */}

      <Modal
        visible={cameraVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={
          handleCloseCamera
        }
      >
        <View
          style={styles.cameraScreen}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <View
            style={styles.cameraHeader}
          >

            {/* CLOSE */}

            <Pressable
              onPress={
                handleCloseCamera
              }
              disabled={
                takingPhoto
              }
              style={
                styles.closeButton
              }
            >
              <Ionicons
                name="close"
                size={30}
                color="#FFFFFF"
              />
            </Pressable>

            {/* TITLE */}

            <Text
              style={styles.cameraTitle}
            >
              Profile Photo
            </Text>

            {/* FLASH */}

            <Pressable
              onPress={
                handleToggleFlash
              }
              disabled={
                takingPhoto
              }
              style={
                styles.flashButton
              }
            >
              <Ionicons
                name={
                  flash === "off"
                    ? "flash-off"
                    : "flash"
                }
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.flashLabel
                }
              >
                {getFlashLabel()}
              </Text>
            </Pressable>

          </View>

          {/* =================================================
              CAMERA AREA
          ================================================= */}

          <View
            style={
              styles.cameraArea
            }
          >

            {/* =================================================
                LIVE CAMERA
            ================================================= */}

            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="picture"
              zoom={0}
              mirror={true}
              flash={flash}
              autofocus="on"
              onCameraReady={() => {
                console.log(
                  "CAMERA READY"
                );

                setCameraReady(true);
              }}
            />

            {/* =================================================
                DARK FACE MASK
            ================================================= */}

            <View
              pointerEvents="none"
              style={
                styles.faceMask
              }
            >

              {/* TOP MASK */}

              <View
                style={
                  styles.maskTop
                }
              />

              {/* MIDDLE */}

              <View
                style={
                  styles.maskMiddle
                }
              >

                {/* LEFT */}

                <View
                  style={
                    styles.maskSide
                  }
                />

                {/* CLEAR FACE AREA */}

                <View
                  style={
                    styles.faceCutout
                  }
                >

                  <View
                    style={
                      styles.faceGuideInner
                    }
                  />

                </View>

                {/* RIGHT */}

                <View
                  style={
                    styles.maskSide
                  }
                />

              </View>

              {/* BOTTOM MASK */}

              <View
                style={
                  styles.maskBottom
                }
              />

            </View>

            {/* =================================================
                FACE GUIDE BORDER
            ================================================= */}

            <View
              pointerEvents="none"
              style={
                styles.faceGuide
              }
            >
              <View
                style={
                  styles.faceGuideInner
                }
              />
            </View>

            {/* =================================================
                GUIDE CORNERS
            ================================================= */}

            <View
              pointerEvents="none"
              style={
                styles.cornerTopLeft
              }
            />

            <View
              pointerEvents="none"
              style={
                styles.cornerTopRight
              }
            />

            <View
              pointerEvents="none"
              style={
                styles.cornerBottomLeft
              }
            />

            <View
              pointerEvents="none"
              style={
                styles.cornerBottomRight
              }
            />

            {/* =================================================
                CAMERA LOADING
            ================================================= */}

            {!cameraReady && (
              <View
                style={
                  styles.loadingOverlay
                }
                pointerEvents="none"
              >
                <View
                  style={
                    styles.loadingCard
                  }
                >
                  <Ionicons
                    name="camera-outline"
                    size={30}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Starting camera...
                  </Text>
                </View>
              </View>
            )}

          </View>

          {/* =================================================
              CAMERA BOTTOM
          ================================================= */}

          <View
            style={styles.cameraBottom}
          >

            {/* STATUS */}

            <View
              style={
                styles.statusBadge
              }
            >
              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }
              >
                Position your face inside
                the frame
              </Text>
            </View>

            {/* HINT */}

            <Text
              style={styles.cameraHint}
            >
              Keep your face centered and
              look directly at the camera
            </Text>

            {/* CAPTURE */}

            <Pressable
              disabled={
                !cameraReady ||
                takingPhoto
              }
              onPress={
                handleTakePhoto
              }
              style={[
                styles.captureButton,
                (!cameraReady ||
                  takingPhoto) &&
                  styles.captureButtonDisabled,
              ]}
            >
              <View
                style={
                  styles.captureInner
                }
              >
                {takingPhoto && (
                  <Ionicons
                    name="camera"
                    size={26}
                    color="#FFFFFF"
                  />
                )}
              </View>
            </Pressable>

            <Text
              style={
                styles.captureLabel
              }
            >
              {takingPhoto
                ? "Capturing..."
                : "Take Photo"}
            </Text>

          </View>

        </View>
      </Modal>

    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // MAIN
  // ===================================================

  container: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },

  // ===================================================
  // PHOTO SECTION
  // ===================================================

  photoSection: {
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: "hidden",
    marginBottom: 18,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 20,
  },

  // ===================================================
  // OPTION BUTTONS
  // ===================================================

  optionButton: {
    width: "100%",
    minHeight: 64,
    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 10,

    marginTop: 10,
  },

  // ===================================================
  // CAMERA BUTTON
  // ===================================================

  cameraButton: {
    backgroundColor: "#2563EB",
  },

  // ===================================================
  // GALLERY BUTTON
  // ===================================================

  galleryButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  // ===================================================
  // ICON
  // ===================================================

  buttonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  galleryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor: "#DBEAFE",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  // ===================================================
  // BUTTON CONTENT
  // ===================================================

  buttonContent: {
    flex: 1,
  },

  optionButtonTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  optionButtonSubtitle: {
    color: "#DBEAFE",
    fontSize: 12,
  },

  galleryButtonTitle: {
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  galleryButtonSubtitle: {
    color: "#64748B",
    fontSize: 12,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  // ===================================================
  // CAMERA SCREEN
  // ===================================================

  cameraScreen: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
  },

  // ===================================================
  // HEADER
  // ===================================================

  cameraHeader: {
    paddingTop: 55,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    zIndex: 20,
  },

  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor:
      "rgba(0,0,0,0.50)",

    justifyContent: "center",
    alignItems: "center",
  },

  cameraTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",

    textShadowColor:
      "rgba(0,0,0,0.5)",

    textShadowOffset: {
      width: 0,
      height: 1,
    },

    textShadowRadius: 3,
  },

  // ===================================================
  // FLASH
  // ===================================================

  flashButton: {
    minWidth: 58,
    height: 46,
    borderRadius: 23,

    paddingHorizontal: 8,

    backgroundColor:
      "rgba(0,0,0,0.50)",

    justifyContent: "center",
    alignItems: "center",
  },

  flashLabel: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "700",
    marginTop: 1,
  },

  // ===================================================
  // CAMERA AREA
  // ===================================================

  cameraArea: {
    width: "100%",
    aspectRatio: 3 / 4,

    alignSelf: "center",

    position: "relative",

    overflow: "hidden",

    backgroundColor: "#000000",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  // ===================================================
  // FACE MASK
  // ===================================================

  faceMask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },

  maskTop: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.58)",
  },

  maskMiddle: {
    height: "64%",

    flexDirection: "row",
  },

  maskSide: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.58)",
  },

  faceCutout: {
    width: "62%",
    height: "100%",

    justifyContent: "center",
    alignItems: "center",
  },

  maskBottom: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.58)",
  },

  // ===================================================
  // FACE GUIDE
  // ===================================================

  faceGuide: {
    position: "absolute",

    zIndex: 5,

    alignSelf: "center",

    top: "18%",

    width: "62%",

    height: "64%",

    borderWidth: 3,

    borderColor: "#FFFFFF",

    borderRadius: 999,

    justifyContent: "center",

    alignItems: "center",
  },

  faceGuideInner: {
    width: "94%",
    height: "94%",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.45)",

    borderRadius: 999,
  },

  // ===================================================
  // CORNER GUIDES
  // ===================================================

  cornerTopLeft: {
    position: "absolute",

    zIndex: 6,

    top: "16%",
    left: "16%",

    width: 28,
    height: 28,

    borderTopWidth: 3,
    borderLeftWidth: 3,

    borderColor: "#FFFFFF",

    borderTopLeftRadius: 8,
  },

  cornerTopRight: {
    position: "absolute",

    zIndex: 6,

    top: "16%",
    right: "16%",

    width: 28,
    height: 28,

    borderTopWidth: 3,
    borderRightWidth: 3,

    borderColor: "#FFFFFF",

    borderTopRightRadius: 8,
  },

  cornerBottomLeft: {
    position: "absolute",

    zIndex: 6,

    bottom: "16%",
    left: "16%",

    width: 28,
    height: 28,

    borderBottomWidth: 3,
    borderLeftWidth: 3,

    borderColor: "#FFFFFF",

    borderBottomLeftRadius: 8,
  },

  cornerBottomRight: {
    position: "absolute",

    zIndex: 6,

    bottom: "16%",
    right: "16%",

    width: 28,
    height: 28,

    borderBottomWidth: 3,
    borderRightWidth: 3,

    borderColor: "#FFFFFF",

    borderBottomRightRadius: 8,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(0,0,0,0.35)",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 20,
  },

  loadingCard: {
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 24,
    paddingVertical: 18,

    borderRadius: 16,

    backgroundColor:
      "rgba(0,0,0,0.65)",
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },

  // ===================================================
  // CAMERA BOTTOM
  // ===================================================

  cameraBottom: {
    alignItems: "center",

    paddingBottom: 35,
    paddingTop: 15,
    paddingHorizontal: 20,
  },

  // ===================================================
  // STATUS
  // ===================================================

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 20,

    backgroundColor:
      "rgba(255,255,255,0.12)",

    marginBottom: 10,
  },

  statusDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: "#FCD34D",

    marginRight: 8,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // ===================================================
  // HINT
  // ===================================================

  cameraHint: {
    color: "#CBD5E1",

    fontSize: 13,

    lineHeight: 19,

    marginBottom: 16,

    textAlign: "center",

    maxWidth: 300,
  },

  // ===================================================
  // CAPTURE BUTTON
  // ===================================================

  captureButton: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 4,

    borderColor:
      "rgba(255,255,255,0.55)",
  },

  captureButtonDisabled: {
    opacity: 0.5,
  },

  captureInner: {
    width: 66,
    height: 66,

    borderRadius: 33,

    backgroundColor: "#2563EB",

    justifyContent: "center",
    alignItems: "center",
  },

  captureLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
});