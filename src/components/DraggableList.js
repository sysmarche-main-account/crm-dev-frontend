"use client";
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  Typography,
  //   styled,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DragIndicator from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { setUserSet } from "@/lib/slices/columnSlice";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: 320,
  borderRadius: "8px",
}));

const SortableItem = ({ item, toggleCheck }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
      disabled: item.disabled,
    });

  const style = {
    transform: item.disabled ? "none" : CSS.Transform.toString(transform),
    transition: item.disabled ? "none" : transition,
    display: "flex",
    width: "100%",
    opacity: item.disabled ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      divider
      sx={{ position: "relative", zIndex: "auto" }}
    >
      <div
        // {...listeners}
        {...(!item.disabled ? listeners : {})}
        {...attributes}
        style={{
          cursor: "grab",
          marginRight: "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <DragIndicator />
      </div>
      <Checkbox checked={item.checked} onChange={() => toggleCheck(item.id)} />
      <ListItemText primary={item.label} />
    </ListItem>
  );
};

const DraggableList = ({ defaultData, data, setData, tableName, onClose }) => {
  const dispatch = useDispatch();

  const [items, setItems] = useState(
    data.map((item, index) => ({ ...item, id: index + 1 }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      // Prevent disabled items from moving
      if (items[oldIndex].disabled || items[newIndex].disabled) {
        return items; // Return the same array (no change)
      }

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const toggleCheck = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const resetToDefault = () => {
    const resetItems = defaultData.map((item, index) => ({
      ...item,
      id: index + 1, // Ensure IDs are consistent
    }));
    setItems(resetItems);
    setData(defaultData);
    dispatch(setUserSet({ table: tableName, data: defaultData }));
  };

  return (
    <StyledPaper elevation={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="500">
          Customize columns
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <List sx={{ maxHeight: "300px", overflow: "auto" }}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                toggleCheck={toggleCheck}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>

      {/* <ButtonGroup fullWidth sx={{ mt: 2 }}> */}
      <div
        style={{
          marginTop: "15px",
          // width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          onClick={resetToDefault}
          sx={{
            backgroundColor: "#eee",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            color: "#7d7d7d",
            width: "120px",
          }}
        >
          Default
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "6px",
            border: "1px solid #e1e1e1",
            width: "120px",
            background:
              "linear-gradient(#00bc70 0%, #06c175 79.91%, #20d48b 100%)",
            boxShadow:
              "inset 0 0 2px 1.5px #ffffff1a, inset 0 -2px 2px .5px #009056",
            display: "flex",
            padding: "8px 18px",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontFamily: "Inter",
            textTransform: "capitalize",
            color: "#000",
          }}
          onClick={() => {
            console.log("item", items);
            dispatch(setUserSet({ table: tableName, data: items }));
            setData(items);
            onClose();
          }}
        >
          Save
        </Button>
      </div>
      {/* </ButtonGroup> */}
    </StyledPaper>
  );
};

export default DraggableList;
