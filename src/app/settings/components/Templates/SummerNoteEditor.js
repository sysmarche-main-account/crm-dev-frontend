"use client";

import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const StyledSummerNoteWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  overflowX: "hidden",
  "& .note-editor": {
    zIndex: 10,
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
  },
  "& .note-toolbar": {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    justifyContent: "flex-start",
  },
  "& .note-toolbar .note-btn-group": {
    display: "flex",
    flexWrap: "wrap",
  },
  "& .note-modal": {
    zIndex: "10 !important",
  },

  /* Hide dropdowns by default; they appear if the parent has `.active` */
  "& .note-dropdown-menu": {
    display: "none",
    position: "absolute",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 11,
    boxSizing: "border-box",
    whiteSpace: "nowrap",
  },
  /* When the note-btn is `.active`, show the dropdown */
  "& .note-btn.active .note-dropdown-menu": {
    display: "block",
  },

  "& .modal": {
    zIndex: "11 !important",
  },
  "& .note-popover": {
    display: "none",
    zIndex: 12,
  },
  "& .note-popover.active": {
    display: "block !important",
  },

  /* Force the color palette to display as a grid (table layout) */
  "& .note-color-palette": {
    display: "table !important",
    borderCollapse: "collapse",
  },
  "& .note-color-row": {
    display: "table-row !important",
  },
  "& .note-color-btn": {
    display: "table-cell !important",
    width: "24px",
    height: "24px",
    padding: 0,
    margin: 0,
    verticalAlign: "middle",
    border: "1px solid transparent",
    cursor: "pointer",
  },
  "& .note-color-btn:hover": {
    borderColor: "#ccc",
  },

  /* Responsive adjustments */
  [theme.breakpoints.down("sm")]: {
    "& .note-toolbar": {
      flexDirection: "column",
      overflowX: "auto",
    },
    "& .note-dropdown-menu": {
      left: 0,
      right: 0,
      overflowX: "auto",
    },
    "& .note-popover": {
      display: "none",
    },
  },
}));

const SummerNoteEditor = ({
  value,
  onChange,
  height = 300,
  placeholder = "",
  selectedVar,
  setSelectedVar,
  ...props
}) => {
  const editorRef = useRef(null);
  const [summernoteInstance, setSummernoteInstance] = useState(null);

  useEffect(() => {
    if (typeof $ !== "undefined" && $.summernote) {
      const $summernote = $(editorRef.current).summernote({
        height,
        placeholder,
        dialogsInBody: true,
        disableDragAndDrop: true,
        shortcuts: false,
        tabDisable: true,
        styleWithSpan: false,
        emptyPara: "<div><br></div>",
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "italic", "underline", "clear"]],
          ["fontname", ["fontname"]],
          ["fontsize", ["fontsize"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["height", ["height"]],
          ["table", ["table"]],
          ["insert", ["link", "picture"]], // removed "video"
          ["view", ["codeview", "help"]],
        ],
        popover: {
          image: [
            [
              "image",
              ["resizeFull", "resizeHalf", "resizeQuarter", "resizeNone"],
            ],
            ["float", ["floatLeft", "floatRight", "floatNone"]],
            ["remove", ["removeMedia"]],
          ],
          link: [["link", ["linkDialogShow", "unlink"]]],
        },
        callbacks: {
          onInit: function () {
            const currentContent = $(editorRef.current).summernote("code");
            if (!currentContent.trim()) {
              $(editorRef.current).summernote("code", "<div><br></div>");
            }
          },
          onChange: (contents) => {
            if (!contents.trim()) {
              $(editorRef.current).summernote("code", "<div><br></div>");
            } else if (contents !== value) {
              onChange(contents);
            }
          },
          onKeydown: (e) => {
            // Prevent tab from moving focus
            if (e.key === "Tab") {
              e.preventDefault();
            }
          },
          onPaste: function (e) {
            const bufferText = (
              (e.originalEvent || e).clipboardData || window.clipboardData
            ).getData("Text");
            e.preventDefault();
            setTimeout(() => {
              document.execCommand("insertText", false, bufferText);
            }, 10);
          },
        },
      });

      // Set initial content
      $summernote.summernote("code", value);

      // ==============================
      // Dropdown toggling via .active
      // ==============================
      // 1. Toggle .active on the clicked .note-btn
      $(editorRef.current)
        .closest(".note-editor") // The editor wrapper
        .find(".note-btn")
        .on("click", function (e) {
          // Only toggle if there's a dropdown menu inside
          const $dropdownMenu = $(this).find(".note-dropdown-menu");
          if ($dropdownMenu.length === 0) return;

          // e.stopPropagation();

          // If this button is already active, close it
          const isActive = $(this).hasClass("active");
          // Remove .active from all buttons in the toolbar
          $(this)
            .closest(".note-toolbar")
            .find(".note-btn")
            .removeClass("active");

          // Toggle .active only if it wasn't active
          if (!isActive) {
            $(this).addClass("active");
          }
        });

      // 2. Close all dropdowns if user clicks outside the toolbar or dropdown
      $(document).on("click", function (e) {
        const $target = $(e.target);
        // If we did not click inside a .note-toolbar or its dropdown
        if (
          !$target.closest(".note-toolbar").length &&
          !$target.closest(".note-dropdown-menu").length
        ) {
          $(".note-btn").removeClass("active");
          $(".note-btn-group").removeClass("open");
        }
      });

      // $(document).on("click", function (e) {
      //   const $target = $(e.target);
      //   // If we did not click inside a .note-toolbar or its dropdown
      //   if (!$target.closest(".note-toolbar").length) {
      //     $(".note-btn-group").removeClass("open");
      //   }
      // });

      // Handle image popover show/hide
      $(editorRef.current).on("click", "img", function () {
        if (window.innerWidth <= 765) {
          $(".note-popover").hide();
        } else {
          $(".note-popover").show();
        }
      });

      setSummernoteInstance($summernote);

      // Cleanup on unmount
      return () => {
        $summernote.summernote("destroy");
        $(document).off("click");
      };
    }
  }, []);

  // Keep editor in sync if `value` changes outside
  useEffect(() => {
    if (
      summernoteInstance &&
      value !== $(editorRef.current).summernote("code")
    ) {
      $(editorRef.current).summernote("code", value);
    }
  }, [value, summernoteInstance]);

  // Insert `selectedVar` at cursor
  useEffect(() => {
    if (selectedVar && summernoteInstance) {
      const editor = $(editorRef.current);
      editor.summernote("focus");
      editor.summernote("editor.insertText", selectedVar);
      setSelectedVar(null);
    }
  }, [selectedVar]);

  return (
    <StyledSummerNoteWrapper>
      <textarea ref={editorRef} defaultValue={value} {...props} />
    </StyledSummerNoteWrapper>
  );
};

export default SummerNoteEditor;
