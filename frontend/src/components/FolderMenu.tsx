// components/FolderMenu.tsx
import React from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function FolderMenu({ folder, isRoot, renameFolder, deleteFolder }: any) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            const newName = prompt("Enter new folder name:", folder.name);
            if (newName) renameFolder(folder.id, newName, isRoot);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            deleteFolder(folder.id, isRoot);
          }}
          style={{ color: "red" }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
