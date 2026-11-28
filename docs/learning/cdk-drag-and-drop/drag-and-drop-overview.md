# Stage 1: How drag and drop works with the Angular CDK

Goal: understand the normal drag-and-drop flow for the kanban board before writing code.
Scenario: a card is dragged from one column to another and dropped. Edge cases are left out.

## The moving parts

| Piece | Role in the kanban board |
| --- | --- |
| `cdkDropList` | A container that accepts cards. One per column, on the card list element. |
| `cdkDrag` | A draggable card. One per card. |
| `cdkDropListGroup` | Wraps the whole board so every column can exchange cards. |
| `cdkDragPlaceholder` / `cdkDragPreview` | Optional templates for the gap left behind and the ghost that follows the pointer. |
| `(cdkDropListDropped)` | The event handled to change data when a drop happens. |

The CDK handles the visual work: it tracks the pointer, moves the ghost, shifts siblings out of the way, and reports the result. Our code handles the data work: it changes the task's status and re-renders.

## The lifecycle of one drag

```
 1. pointerdown on a card
        |
        v
 2. CDK creates a PREVIEW (ghost, follows the pointer)
    and leaves a PLACEHOLDER (gap) in the original list
        |
        v
 3. pointermove
    - CDK finds the drop list under the pointer
    - that list gets the class  cdk-drop-list-receiving
    - sibling cards slide with CSS transforms to open a gap
        |
        v
 4. pointerup
    - CDK fires (cdkDropListDropped) with:
        previousContainer, container, previousIndex, currentIndex, item
    - CDK removes the preview and placeholder
        |
        v
 5. OUR handler updates the data (signal / repository)
    - Angular re-renders the columns from the new data
    - the card appears in its new place
```

Step 5 is the key point. The CDK moves the card visually, and only our handler makes the move real. Without step 5, the card snaps back on the next render.

## How the code looks (conceptually)

```html
<!-- board: one group, so columns can exchange cards -->
<div cdkDropListGroup class="board">

  @for (column of columns(); track column.status) {
    <section class="column">
      <header>{{ column.label }} ({{ column.tasks.length }})</header>

      <!-- one drop list per column -->
      <div cdkDropList
           [cdkDropListData]="column.status"
           (cdkDropListDropped)="onDrop($event)"
           class="card-list">

        @for (task of column.tasks; track task.id) {
          <app-task-card cdkDrag [cdkDragData]="task" [task]="task" />
        }
      </div>
    </section>
  }
</div>
```

```ts
onDrop(event: CdkDragDrop<TaskStatus>) {
  // same column: reorder. Different column: the status changes.
  // (Stages 4 and 5 cover both branches.)
}
```

Track by `task.id`, not by index. When a card moves, Angular must move the same DOM node, not rebuild the list.

## How the "Jira" highlight works

The CDK adds classes to the elements it manages, so they are styled with plain CSS:

| Class | Put on | When |
| --- | --- | --- |
| `cdk-drop-list-receiving` | the drop list | the card is hovering over that column |
| `cdk-drag-preview` | the ghost card | while dragging |
| `cdk-drag-placeholder` | the gap | while dragging |
| `cdk-drag-animating` | sliding cards | during the shift animation |

A minimal version of the effect:

```css
.column {
  background: #f4f5f7;
  border-radius: 6px;
  transition: background 150ms;
}

/* the column under the pointer glows */
.card-list.cdk-drop-list-receiving {
  background: #deebff;
  outline: 2px dashed #4c9aff;
}

/* the ghost card tilts and gets a shadow */
.cdk-drag-preview {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transform: rotate(2deg);
}

/* the gap left behind */
.cdk-drag-placeholder {
  opacity: 0.3;
}
```

Two things make this look right:
- The drop list needs a minimum height, so an empty column is still a target.
- `cdk-drop-list-receiving` is on the list element itself, so the highlight stays on the column the card is over. The effect is pure CSS; no component logic is needed.

## The mental model in one sentence

The CDK is a pointer-tracking engine that reports *which list* and *which index* the user chose. Our code turns that into a status change, and Angular redraws the board.

## Before Stage 2

1. The CDK never edits our data. It only reports indexes and containers.
2. The `cdkDropListData` on each list tells the drop handler the target status.
3. Visual feedback comes from CSS classes the CDK adds, so the Jira look is styling work, not API work.
