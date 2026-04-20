import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Modal size variant.
 * - "small":  short alerts/confirms (e.g. ErrorAlert, DeleteDeviceModal)
 * - "medium": single-input forms (e.g. AddPhoneModal, RenameDeviceModal)
 * - "large":  multi-field forms (e.g. SiteModal, AddFlaggedSiteModal)
 */
export type ModalSize = "small" | "medium" | "large";

/**
 * MUI breakpoint reference (px):
 *   xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536
 *
 * Width per breakpoint, per size variant.
 * On `xs` (phones) every variant fills the viewport minus a 24px gutter on
 * each side so there is a visible margin between the modal and the screen
 * edge, and the modal never overflows.
 */
const widthBySize: Record<ModalSize, Record<string, number | string>> = {
  small: {
    xs: "calc(100% - 48px)",
    sm: 360,
    md: 400,
  },
  medium: {
    xs: "calc(100% - 48px)",
    sm: 420,
    md: 480,
    lg: 520,
  },
  large: {
    xs: "calc(100% - 48px)",
    sm: 500,
    md: 600,
    lg: 700,
    xl: 760,
  },
};

/**
 * Returns a responsive `sx` object for a Modal's content Box.
 *
 * Replaces the hard-coded `width: 400` pattern that used to overflow on
 * mobile viewports. Width, padding and max dimensions all scale with the
 * MUI theme breakpoints so the modal fits any device from a 320px phone
 * up to a 1536px+ desktop.
 *
 * Usage:
 *   import { getModalStyle } from "../utils/modalStyle";
 *   <Box sx={getModalStyle("medium")}> ... </Box>
 */
export function getModalStyle(size: ModalSize = "medium"): SxProps<Theme> {
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: widthBySize[size],
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    overflowX: "hidden",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
  };
}
