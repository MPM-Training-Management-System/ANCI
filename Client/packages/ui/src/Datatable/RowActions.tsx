"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface RowAction {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface RowActionsProps {
  actions: RowAction[];
}

export function RowActions({
  actions,
}: RowActionsProps) {
  const [open, setOpen] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef =
    useRef<HTMLButtonElement | null>(null);

  const menuRef =
    useRef<HTMLDivElement | null>(null);

  // =====================================================
  // POSITION DROPDOWN
  // =====================================================

  const updatePosition = () => {
    if (!buttonRef.current) {
      return;
    }

    const rect =
      buttonRef.current.getBoundingClientRect();

    const menuWidth = 208;
    const menuHeight =
      actions.length * 44 + 16;

    const gap = 8;

    // -----------------------------------------------
    // Horizontal position
    // -----------------------------------------------

    let left =
      rect.right - menuWidth;

    // Prevent going outside viewport
    if (left < 8) {
      left = 8;
    }

    if (
      left + menuWidth >
      window.innerWidth - 8
    ) {
      left =
        window.innerWidth -
        menuWidth -
        8;
    }

    // -----------------------------------------------
    // Vertical position
    // -----------------------------------------------

    let top =
      rect.bottom + gap;

    // If there is not enough space below,
    // open ABOVE the button instead.
    if (
      top + menuHeight >
      window.innerHeight - 8
    ) {
      top =
        rect.top -
        menuHeight -
        gap;
    }

    // Final safety
    if (top < 8) {
      top = 8;
    }

    setPosition({
      top,
      left,
    });
  };

  // =====================================================
  // OPEN / CLOSE
  // =====================================================

  const toggleMenu = () => {
    if (!open) {
      updatePosition();
    }

    setOpen(
      (previous) => !previous
    );
  };

  // =====================================================
  // UPDATE POSITION WHEN SCROLLING / RESIZING
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleScroll = () => {
      updatePosition();
    };

    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [open]);

  // =====================================================
  // CLICK OUTSIDE / ESCAPE
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        buttonRef.current?.contains(
          target
        )
      ) {
        return;
      }

      if (
        menuRef.current?.contains(
          target
        )
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  // =====================================================
  // ACTION CLICK
  // =====================================================

  const handleActionClick = (
    action: RowAction
  ) => {
    if (action.disabled) {
      return;
    }

    setOpen(false);

    action.onClick();
  };

  return (
    <>
      {/* =================================================
          ACTION BUTTON
      ================================================= */}

      <div className="flex justify-end">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-haspopup="menu"
          aria-expanded={open}
          className="
            flex
            h-9
            w-9
            cursor-pointer
            items-center
            justify-center
            rounded-lg
            border
            transition
            hover:bg-muted
          "
        >
          <MoreHorizontal
            className="h-4 w-4"
          />
        </button>
      </div>

      {/* =================================================
          DROPDOWN
          
          PORTAL = rendered directly under body
          
          This prevents DataTable overflow from
          clipping the dropdown.
      ================================================= */}

      {open &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: 208,
              zIndex: 99999,
            }}
            className="
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-xl
            "
          >
            {actions.map(
              (
                action,
                index
              ) => (
                <button
                  key={index}
                  type="button"
                  role="menuitem"
                  disabled={
                    action.disabled
                  }
                  onClick={() =>
                    handleActionClick(
                      action
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-2.5
                    text-sm
                    transition
                    hover:bg-gray-100
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    ${
                      action.danger
                        ? "text-red-600"
                        : "text-gray-700"
                    }
                  `}
                >
                  {action.icon}

                  <span>
                    {action.label}
                  </span>
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}