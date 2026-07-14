"use client"

import { ReactRenderer } from "@tiptap/react"
import type { ComponentType } from "react"
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion"

export interface SuggestionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

// Shared floating-popup renderer for Tiptap Suggestion plugins (mention, slash command).
// Uses SuggestionProps.mount() for positioning — no tippy.js dependency needed.
export function createSuggestionRender<TItem, TExtra extends object = object>(
  Component: ComponentType<SuggestionProps<TItem> & TExtra>,
  extraProps?: TExtra
) {
  return () => {
    let component: ReactRenderer<SuggestionListRef, SuggestionProps<TItem> & TExtra>
    let unmount: (() => void) | undefined

    return {
      onStart: (props: SuggestionProps<TItem>) => {
        component = new ReactRenderer(Component, {
          props: { ...props, ...(extraProps as TExtra) },
          editor: props.editor,
        })
        unmount = props.mount(component.element as HTMLElement)
      },
      onUpdate: (props: SuggestionProps<TItem>) => {
        component.updateProps({ ...props, ...(extraProps as TExtra) })
      },
      onKeyDown: (props: SuggestionKeyDownProps): boolean => {
        if (props.event.key === "Escape") {
          unmount?.()
          return true
        }
        return component.ref?.onKeyDown(props.event) ?? false
      },
      onExit: () => {
        unmount?.()
        component.destroy()
      },
    }
  }
}
