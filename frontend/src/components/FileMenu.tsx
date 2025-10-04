import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem, IconButton } from "@mui/material";
import api from "../api/api";


interface FileMenuProps {
  file: { id: number; name: string };
  deleteFile: (id: number) => void;
}

export default function FileMenu({ file, deleteFile }: FileMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); 
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleClick(e);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Download */}
        <MenuItem
          component="a"
          href={`${api.defaults.baseURL}/files/${file.id}/download`}
          target="_blank"
          rel="noopener noreferrer"
         
        >
          Download
        </MenuItem>

        <MenuItem
        component="a"
        href={`${api.defaults.baseURL}/files/${file.id}/preview`}
        target="_blank"
        rel="noopener noreferrer"
        >
        Preview
        </MenuItem>

        {/* Delete */}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            deleteFile(file.id);
          }}
          style={{ color: "red" }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
