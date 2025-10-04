import React, { useEffect, useState, useRef } from "react";
import api from "./api/api";
import { Folder, File as DbFile } from "./types/types";
import Login from "./components/Login";
import Register from "./components/Register";
import "./styles/App.css";
import Topbar from "./components/Topbar";
import FolderIcon from "@mui/icons-material/Folder";
import FolderMenu from "./components/FolderMenu";
import FileMenu from "./components/FileMenu";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";  
import ImageIcon from "@mui/icons-material/Image";     
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


function FileManager({ onLogout }: { onLogout: () => void }) {
  const [rootFolders, setRootFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [newRootName, setNewRootName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");


  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DbFile[]>([]);

  const buildPath = (folder: Folder | null, allFolders: Folder[]): string => {
    if (!folder) return "";
    const parent = allFolders.find(f => f.id === folder.parent_id);
    if (parent) {
      return buildPath(parent, allFolders) + " / " + folder.name;
    }
    return folder.name; 
  };


  // Fetch folder
const [breadcrumbPath, setBreadcrumbPath] = useState<Folder[]>([]);
const [folderMap, setFolderMap] = useState<Record<number, Folder>>({});



const fetchFolder = async (id: number, resetPath = false) => {
  try {
    setLoading(true);
    const res = await api.get(`/folders/${id}`);
    const folder: Folder = res.data;

    setCurrentFolder(folder);
    
    setFolderMap((prev) => ({ ...prev, [folder.id]: folder }));

    const path: Folder[] = [];
    let current: Folder | null = folder;

    while (current) {
      path.unshift(current);
      current = current.parent_id ? folderMap[current.parent_id] || null : null;
    }

    setBreadcrumbPath(path);
    setSearchResults([]);
  } catch (error) {
    console.error("Error fetching folder:", error);
  } finally {
    setLoading(false);
  }
};


  // Fetch root folders
  const fetchRootFolders = async () => {
    try {
      const res = await api.get("/folders?parent_id=null");
      setRootFolders(res.data);
    } catch (error) {
      console.error("Error fetching root folders:", error);
    }
  };

  useEffect(() => {
    fetchRootFolders();
  }, []);

  // Create subfolder
  const createSubFolder = async () => {
    if (!newFolderName || !currentFolder) return;
    try {
      const res = await api.post("/folders", {
        name: newFolderName,
        parent_id: currentFolder.id,
      });
      setCurrentFolder({
        ...currentFolder,
        subfolders: [...(currentFolder.subfolders || []), res.data],
      });
      setNewFolderName("");
    } catch (error) {
      console.error("Error creating subfolder:", error);
    }
  };

  // Create root folder
  const createRootFolder = async () => {
    if (!newRootName) return;
    try {
      await api.post("/folders", { name: newRootName, parent_id: null });
      await fetchRootFolders();
      setNewRootName("");
    } catch (error) {
      console.error("Error creating root folder:", error);
    }
  };

  // Upload file
  const uploadFile = async () => {
    if (!file || !currentFolder) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder_id", currentFolder.id.toString());
      const res = await api.post("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCurrentFolder({
        ...currentFolder,
        files: [...(currentFolder.files || []), res.data],
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  // Delete file
  const deleteFile = async (id: number) => {
    if (!currentFolder) return;
    try {
      await api.delete(`/files/${id}`);
      setCurrentFolder({
        ...currentFolder,
        files: currentFolder.files?.filter((f) => f.id !== id) || [],
      });
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  // Rename folder
  const renameFolder = async (
    id: number,
    newName: string,
    isRoot: boolean = false
  ) => {
    try {
      const res = await api.put(`/folders/${id}`, { name: newName });
      const updatedName = res.data.name;

      if (isRoot) {
        setRootFolders((prev) =>
          prev.map((f) => (f.id === id ? { ...f, name: updatedName } : f))
        );
      } else if (currentFolder) {
        setCurrentFolder({
          ...currentFolder,
          subfolders: currentFolder.subfolders?.map((sub) =>
            sub.id === id ? { ...sub, name: updatedName } : sub
          ),
        });
      }
    } catch (err) {
      console.error("Rename folder error:", err);
    }
  };

  // Delete folder
  const deleteFolder = async (id: number, isRoot: boolean = false) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    )
      return;
    try {
      await api.delete(`/folders/${id}`);
      if (isRoot) {
        setRootFolders(rootFolders.filter((f) => f.id !== id));
        if (currentFolder?.id === id) setCurrentFolder(null);
      } else if (currentFolder) {
        setCurrentFolder({
          ...currentFolder,
          subfolders: currentFolder.subfolders?.filter(
            (sub) => sub.id !== id
          ),
        });
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  // Search files
  const searchFiles = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };



  return (
    <div className="app-container">
      {/* Topbar */}
      <Topbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={searchFiles}
        onLogout={onLogout}
        searchResults={searchResults}  
        fetchFolder={fetchFolder}
      />

      {/* Content area (sidebar + main) */}
      <div className="content">
        {/* Sidebar */}
        <div className="sidebar">

            <div className="add-root">
            <input
              type="text"
              placeholder="New root folder"
              value={newRootName}
              onChange={(e) => setNewRootName(e.target.value)}
              className="text-input"
            />
            <button onClick={createRootFolder} className="primary-btn">
              + Add
            </button>
          </div>

          <div className="sidebar-header">
            <ChevronRightIcon style={{ fontSize: 20, color: "#6b7280", marginRight: "8px" }} />

            <h2>Folders</h2>
          </div>

          {rootFolders.map((f) => (
            <div
              key={f.id}
              onClick={() => fetchFolder(f.id)}
              className={`folder-entry ${
                currentFolder?.id === f.id ? "active" : ""
              }`}
            >
              <span>
                <FolderIcon style={{ fontSize: 18, color: "#fbbf24", marginRight: "6px" }} />
                {f.name}
              </span>
              <FolderMenu
                folder={f}
                isRoot={true}
                renameFolder={renameFolder}
                deleteFolder={deleteFolder}
              />
            </div>
          ))}
        </div>

        {/* Main Area */}
        <div className="main">
          {loading ? (
            <p className="italic">Loading...</p>
          ) : currentFolder ? (
            <>
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                {breadcrumbPath.map((f, idx) => (
                  <React.Fragment key={f.id}>
                    <span
                      className={`cursor-pointer px-1 rounded 
                        ${idx === breadcrumbPath.length - 1 
                          ? "font-semibold text-gray-900" 
                          : "hover:bg-gray-100 hover:text-blue-600"}`} 
                      onClick={() => fetchFolder(f.id, true)}
                    >
                      {f.name}
                    </span>
                    {idx < breadcrumbPath.length - 1 && (
                      <span className="text-gray-400">›</span> 
                    )}
                  </React.Fragment>
                ))}
              </div>




             {/* Subfolders */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRightIcon
                    style={{ fontSize: 20, color: "#6b7280" }}
                  />
                  <h2 className="font-semibold">Subfolders</h2>
                </div>

                {/* Add subfolder input */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="New subfolder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="text-input"
                  />
                  <button onClick={createSubFolder} className="primary-btn">
                    + Add
                  </button>
                </div>

                {currentFolder.subfolders?.length ? (
                  <div className="file-table">
                    {/* Table Header */}
                    <div className="file-row file-header">
                      <span className="file-col name">Name</span>
                      <span className="file-col created">Created</span>
                      <span className="file-col actions"></span>
                    </div>

                    {/* Table Rows */}
                    {currentFolder.subfolders.map((sub) => (
                      <div key={sub.id} className="file-row">
                        <span
                          className="file-col name subfolder-name"
                          onClick={() => fetchFolder(sub.id)}
                        >
                          <FolderIcon style={{ fontSize: 20, color: "#fbbf24" }} />
                          {sub.name}
                        </span>

                        <span className="file-col created">
                          {new Date(sub.created_at || Date.now()).toLocaleDateString()}
                        </span>

                        <span className="file-col actions">
                          <FolderMenu
                            folder={sub}
                            renameFolder={renameFolder}
                            deleteFolder={deleteFolder}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No subfolders yet</p>
                )}
              </div>

              {/* Files */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRightIcon
                    style={{ fontSize: 20, color: "#6b7280" }}
                  />
                  <h2 className="font-semibold">Files</h2>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                    className="text-input"
                  />
                  <button onClick={uploadFile} className="primary-btn">
                    Upload
                  </button>
                </div>

              {currentFolder.files?.length ? (
                viewMode === "list" ? (
                <div className="file-table">
                  {/* Header */}
                  <div className="file-row file-header">
                    <span className="file-col name">Name</span>
                    <span className="file-col created">Created</span>
                    <span className="file-col actions"></span>
                  </div>

                   {/* Files */}
                  {currentFolder.files.map((file) => (
                    <div key={file.id} className="file-row">
                      <span
                        className="file-col name cursor-pointer hover:underline flex items-center gap-2"
                        onClick={() =>
                            window.open(`${api.defaults.baseURL}/files/${file.id}/preview`, "_blank")
                          }
                        >
                        {/* Icon + filename */}
                        {file.name.endsWith(".pdf") ? (
                          <PictureAsPdfIcon style={{ color: "red" }} />
                        ) : file.name.endsWith(".docx") || file.name.endsWith(".doc") ? (
                          <DescriptionIcon style={{ color: "blue" }} />
                        ) : file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <ImageIcon style={{ color: "green" }} />
                        ) : (
                          <InsertDriveFileIcon style={{ color: "gray" }} />
                        )}
                        
                        {file.name}
                      </span>

                      <span className="file-col created">
                        {new Date(file.created_at || Date.now()).toLocaleDateString()}
                      </span>

                      <span className="file-col actions">
                        <FileMenu file={file} deleteFile={deleteFile} />
                      </span>
                    </div>
                  ))}

                </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {currentFolder.files?.map((file) => (
                      <div key={file.id} className="file-card">
                        <div className="file-thumbnail">📄</div>
                        <span className="file-name">{file.name}</span>
                        <FileMenu file={file} deleteFile={deleteFile} />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-gray-500 italic">No files uploaded yet</p>
              )}
              </div>
            </>
          ) : (
            
            <p>Select a folder from the sidebar</p>
          )}
        </div>
      </div>
    </div>
  );
}

// App wrapper
export default function App() {
  const [authState, setAuthState] = useState<
    "login" | "register" | "app"
  >("login");

  if (authState === "login") {
    return (
      <Login
        onLogin={() => setAuthState("app")}
        switchToRegister={() => setAuthState("register")}
      />
    );
  }

  if (authState === "register") {
    return (
      <Register switchToLogin={() => setAuthState("login")} />
    );
  }

  return (
    <FileManager
      onLogout={() => {
        localStorage.removeItem("token");
        setAuthState("login");
      }}
    />
  );
}
