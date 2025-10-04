import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import type { File as DbFile } from "../types/types";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";


interface TopbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearch: () => void;
  onLogout: () => void;


  searchResults: DbFile[];
  fetchFolder: (id: number) => void;
}

export default function Topbar({
  searchTerm,
  setSearchTerm,
  onSearch,
  onLogout,
  searchResults,
  fetchFolder,
}: TopbarProps) {
  return (
    <div className="topbar-container">
      {/* Row 1: Branding */}
      <div className="topbar-header">
        <span className="logo">Dataroom</span>
      </div>

      {/* Row 2: Search + Logout */}
      <div className="topbar">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="search-input"
          />

        {/* Results dropdown */}
        {searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((f) => (
              <div
                key={f.id}
                className="search-result"
                onClick={() => fetchFolder(f.folder_id)}
              >
                <InsertDriveFileIcon style={{ fontSize: 18, color: "#6b7280" }} />
                {f.name}
              </div>
            ))}
          </div>
        )}
        </div>

        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}
