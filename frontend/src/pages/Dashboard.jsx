import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "remixicon/fonts/remixicon.css";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { asyncLoadMessages } from "../store/actions/messageAction";
import { pushmessage } from "../store/reducers/messageSlice";
import { logoutchats } from "../store/reducers/chatSlice";
import { asyncAddNewChat } from "../store/actions/chatAction";
import { asyncLogoutUser } from "../store/actions/userAction";
import { asyncLoadPresets } from "../store/actions/contextAction";
import { DEFAULT_PRESETS } from "../store/reducers/contextSlice";
import { io } from "socket.io-client";
import axios from "../api/axiosconfig";
import PresetCardGrid from "../components/PresetCardGrid";
import UploadContextCard from "../components/UploadContextCard";

const Dashboard = () => {
  const [socket, setSocket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New Chat On-Screen States
  const [selectedPresetMode, setSelectedPresetMode] = useState("default");
  const [newChatTitle, setNewChatTitle] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { reset, register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentChatMessages = useSelector(state => state.messageReducer.messages);
  const currentUser = useSelector(state => state?.userReducer?.user);
  const chats = useSelector(state => state.chatReducer.chats);
  const presetsFromStore = useSelector(state => state.contextReducer?.presets);
  const presets = (presetsFromStore && presetsFromStore.length > 0) ? presetsFromStore : DEFAULT_PRESETS;

  // Ensure presets are loaded
  useEffect(() => {
    dispatch(asyncLoadPresets());
  }, [dispatch]);

  // Helper: get preset meta
  const getPreset = (contextMode) =>
    presets.find(p => p.id === contextMode) || presets[0] || {
      id: "default",
      icon: "🤖",
      label: "General Assistant",
      description: "Helpful and intelligent general-purpose AI assistant",
      color: "#7c6aee"
    };

  // Selected preset for new chat
  const currentSelectedPreset = getPreset(selectedPresetMode);

  // Socket connection
  useEffect(() => {
    const tempSocket = io("https://chatmate-lkzj.onrender.com", { withCredentials: true });
    setSocket(tempSocket);
    return () => tempSocket.disconnect();
  }, []);

  // Load chat messages when activeChat changes
  useEffect(() => {
    if (activeChat?._id) {
      dispatch(asyncLoadMessages(activeChat._id));
    }
  }, [activeChat, dispatch]);

  // Sync activeChat if chats list changes
  useEffect(() => {
    if (activeChat && chats && chats.length > 0) {
      const updated = chats.find(c => c._id === activeChat._id);
      if (updated) setActiveChat(updated);
    }
  }, [chats]);

  // Socket message listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("ai-response", (response) => {
      setIsTyping(false);
      const aiResponse = {
        userId: currentUser?._id,
        chatId: activeChat?._id,
        content: response?.content,
        role: "model",
      };
      dispatch(pushmessage(aiResponse));
    });

    socket.on("ai-error", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("ai-response");
      socket.off("ai-error");
    };
  }, [dispatch, activeChat, currentUser, socket]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChatMessages, isTyping]);

  // Handle creating a new chat from the on-screen preset cards
  const handleStartNewChat = async (initialPrompt = "") => {
    setIsCreatingChat(true);
    const finalTitle = newChatTitle.trim() || `${currentSelectedPreset?.label || 'New'} Session`;

    try {
      const newChat = await dispatch(asyncAddNewChat({
        title: finalTitle,
        contextMode: selectedPresetMode,
        customContext: customContext
      }));

      if (newChat) {
        setActiveChat(newChat);
        setNewChatTitle("");
        setCustomContext("");

        // If an initial prompt was entered, dispatch and emit immediately
        if (initialPrompt && initialPrompt.trim()) {
          const userMessage = {
            userId: currentUser?._id,
            chatId: newChat._id,
            content: initialPrompt.trim(),
            role: "user",
          };
          dispatch(pushmessage(userMessage));
          setIsTyping(true);

          socket.emit("ai-message", {
            chatId: newChat._id,
            content: initialPrompt.trim(),
          });
        }
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle prompt input submission
  const inputHandler = async (data) => {
    if (!data.prompt?.trim()) return;
    const prompt = data.prompt.trim();

    if (formRef.current) {
      const textarea = formRef.current.querySelector("textarea");
      if (textarea) textarea.style.height = "auto";
    }

    // If no active chat, create one with the selected preset card
    if (!activeChat) {
      reset();
      await handleStartNewChat(prompt);
      return;
    }

    // If chat is active, send message normally
    const userMessage = {
      userId: currentUser?._id,
      chatId: activeChat._id,
      content: prompt,
      role: "user",
    };
    dispatch(pushmessage(userMessage));
    setIsTyping(true);

    socket.emit("ai-message", {
      chatId: activeChat._id,
      content: prompt,
    });
    reset();
  };

  const handleActiveChat = (chat) => {
    setActiveChat(chat);
    setIsSidebarOpen(false);
  };

  const handleResetToNewChat = () => {
    setActiveChat(null);
    setNewChatTitle("");
    setCustomContext("");
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await axios.delete(`/api/messages/${chatId}`, { withCredentials: true });
      const response = await axios.delete(`/api/chat/${chatId}`, { withCredentials: true });
      if (response?.data?.success) {
        dispatch(logoutchats(chatId));
        if (activeChat?._id === chatId) setActiveChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleLogout = async () => {
    await dispatch(asyncLogoutUser());
    navigate("/login");
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered chats by search
  const filteredChats = (chats || []).filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (c.title || "").toLowerCase().includes(q);
    const modeMatch = (c.contextMode || "").toLowerCase().includes(q);
    return titleMatch || modeMatch;
  });

  const activePreset = activeChat ? getPreset(activeChat.contextMode) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07070d] text-white relative font-sans">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,106,238,0.08)_0%,transparent_40%),radial-gradient(circle_at_85%_85%,rgba(157,133,251,0.06)_0%,transparent_40%),radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.03)_0%,transparent_60%)]" />

      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ==========================================
          SIDEBAR (TAILWIND RESPONSIVE DRAWER)
          ========================================== */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-72 h-full flex flex-col bg-[#0d0d18]/95 backdrop-blur-2xl border-r border-white/10 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/30">
              <i className="ri-brain-line" />
            </div>
            <div>
              <div className="text-base font-extrabold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                ContextGPT
              </div>
              <div className="text-[10px] text-zinc-400">Context-Aware Intelligence</div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            id="mobile-sidebar-close"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* New Chat Button (Presents Cards On Screen) */}
        <div className="p-3">
          <button
            id="sidebar-new-chat-btn"
            onClick={handleResetToNewChat}
            className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/30 hover:border-indigo-400 text-white font-semibold text-xs flex items-center justify-between shadow-sm hover:shadow-indigo-500/20 transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <i className="ri-add-circle-line text-base text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>New Conversation</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5">
              Presets
            </span>
          </button>
        </div>

        {/* Search Chats Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs" />
            <input
              type="text"
              className="w-full rounded-xl bg-white/[0.04] border border-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Recent Chats ({filteredChats.length})
          </div>

          {filteredChats.length === 0 ? (
            <div className="text-center text-zinc-500 text-xs py-8 px-4">
              {searchQuery ? "No chats match your search." : "No chats yet. Start your first session!"}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const preset = getPreset(chat.contextMode);
              const isActive = activeChat?._id === chat._id;
              return (
                <div
                  key={chat._id}
                  id={`chat-item-${chat._id}`}
                  onClick={() => handleActiveChat(chat)}
                  className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-950/60 to-purple-950/30 border-indigo-500/50 text-white shadow-sm"
                      : "border-transparent hover:bg-white/[0.05] text-zinc-300 hover:border-white/5"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border"
                    style={{
                      background: isActive ? `${preset.color}25` : "rgba(255,255,255,0.04)",
                      borderColor: isActive ? `${preset.color}50` : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {preset.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate text-white">
                      {chat.title || "Untitled Session"}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 truncate">
                      <span style={{ color: preset.color || "#818cf8" }}>●</span>
                      <span>{preset.label}</span>
                      {chat.customContext && <span title="Has custom context attachment">📎</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete chat"
                    aria-label={`Delete ${chat.title}`}
                  >
                    <i className="ri-delete-bin-line text-xs" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User Footer Profile */}
        <div className="p-3.5 border-t border-white/10 flex items-center justify-between bg-black/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-indigo-500/30 shrink-0">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate max-w-[130px]">
                {currentUser?.name || "User"}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Online
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log out"
            aria-label="Log out"
          >
            <i className="ri-logout-box-r-line text-sm" />
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CHAT WORKSPACE
          ========================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Workspace Top Bar */}
        <header className="h-16 px-4 sm:px-6 border-b border-white/10 bg-[#0d0d18]/70 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="mobile-hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <i className="ri-menu-2-line text-lg" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {activeChat ? activeChat.title : "New Conversation"}
              </h2>

              {activePreset ? (
                <div
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: `${activePreset.color}40`,
                    background: `${activePreset.color}15`,
                    color: activePreset.color || "#818cf8",
                  }}
                >
                  <span>{activePreset.icon}</span>
                  <span>{activePreset.label}</span>
                </div>
              ) : (
                <div
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: `${currentSelectedPreset.color}40`,
                    background: `${currentSelectedPreset.color}15`,
                    color: currentSelectedPreset.color || "#818cf8",
                  }}
                >
                  <span>{currentSelectedPreset.icon}</span>
                  <span>{currentSelectedPreset.label} Selected</span>
                </div>
              )}

              {activeChat?.customContext && (
                <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <i className="ri-file-text-line" />
                  <span>Custom Context</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeChat && (
              <button
                id="header-new-chat-btn"
                onClick={handleResetToNewChat}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <i className="ri-add-line" />
                <span>Preset Cards</span>
              </button>
            )}
          </div>
        </header>

        {/* Workspace Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" id="messages-container">
          {!activeChat ? (
            /* =========================================================
               ON-SCREEN PRESET CARDS SELECTOR FOR EVERY NEW CHAT
               ========================================================= */
            <div className="max-w-5xl w-full mx-auto py-4 space-y-6">
              {/* Header Hero */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <i className="ri-sparkling-fill" />
                  <span>Select Predefined Context</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Choose a Context Persona for Your New Chat
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Select one of the predefined context cards below to calibrate the AI with specialized knowledge, tone, and formatting rules.
                </p>
              </div>

              {/* Chat Title Input and Quick Start */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md p-4 sm:p-5 flex items-center gap-4 flex-wrap shadow-lg">
                <div className="flex-1 min-w-[240px]">
                  <label htmlFor="new-chat-session-title" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Chat Title (Optional)
                  </label>
                  <input
                    id="new-chat-session-title"
                    type="text"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder={`e.g. My ${currentSelectedPreset?.label || 'General'} Session...`}
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                  />
                </div>

                <div className="self-end">
                  <button
                    type="button"
                    onClick={() => handleStartNewChat("")}
                    disabled={isCreatingChat}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingChat ? (
                      <>
                        <i className="ri-loader-4-line ri-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>{currentSelectedPreset.icon}</span>
                        <span>Start Chat with {currentSelectedPreset.label}</span>
                        <i className="ri-arrow-right-line" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1. All Available Presets in Card Format */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Available Predefined Context Cards ({presets.length})
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Active Persona: <strong style={{ color: currentSelectedPreset.color || "#818cf8" }}>{currentSelectedPreset.label}</strong>
                  </span>
                </div>

                <PresetCardGrid
                  selectedMode={selectedPresetMode}
                  onSelectMode={(modeId) => setSelectedPresetMode(modeId)}
                />
              </div>

              {/* 2. Attach Document / Custom Context Card */}
              <div className="pt-2">
                <UploadContextCard
                  customContext={customContext}
                  onCustomContextChange={(text) => setCustomContext(text)}
                />
              </div>
            </div>
          ) : (
            /* =========================================================
               ACTIVE CONVERSATION STREAM
               ========================================================= */
            <div className="max-w-4xl w-full mx-auto space-y-4">
              {/* Context notification banner */}
              <div
                className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs"
                style={{
                  background: `${activePreset?.color || "#7c6aee"}10`,
                  borderColor: `${activePreset?.color || "#7c6aee"}30`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{activePreset?.icon}</span>
                  <div>
                    <span className="font-bold text-white">
                      {activePreset?.label} Mode Active
                    </span>
                    <span className="text-zinc-400 ml-2 hidden sm:inline">
                      {activePreset?.description}
                    </span>
                  </div>
                </div>
                {activeChat.customContext && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    📎 Document Attached
                  </span>
                )}
              </div>

              {/* Message List */}
              {currentChatMessages.map((msg, index) => {
                const isUser = msg.role === "user";
                const msgId = msg._id || index;
                return (
                  <div
                    key={msgId}
                    className={`flex items-start gap-3 w-full animate-in fade-in duration-200 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border shadow-md"
                        style={{
                          background: `${activePreset?.color || "#7c6aee"}20`,
                          borderColor: `${activePreset?.color || "#7c6aee"}40`,
                        }}
                      >
                        {activePreset?.icon || "🤖"}
                      </div>
                    )}

                    <div className="flex flex-col max-w-[82%] sm:max-w-[76%]">
                      <div
                        className={`rounded-2xl p-4 text-sm leading-relaxed shadow-md ${
                          isUser
                            ? "bg-zinc-800/90 text-white rounded-tr-none border border-white/10"
                            : "bg-zinc-900/90 text-zinc-100 rounded-tl-none border border-white/10 prose prose-invert max-w-none prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/10"
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>

                      {/* Bubble Action Bar */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <button
                            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 p-1 rounded transition-colors cursor-pointer"
                            onClick={() => handleCopyMessage(msg.content, msgId)}
                          >
                            <i className={copiedId === msgId ? "ri-check-line text-emerald-400" : "ri-file-copy-line"} />
                            <span>{copiedId === msgId ? "Copied!" : "Copy response"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm shrink-0">
                        <i className="ri-user-3-line" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Thinking Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3 w-full">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-lg shrink-0">
                    {activePreset?.icon || "🤖"}
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl rounded-tl-none bg-zinc-900/90 border border-indigo-500/30 text-xs text-zinc-400 shadow-md">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    </div>
                    <span>{activePreset?.label} is generating response...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="w-full max-w-4xl mx-auto px-4 pb-4 shrink-0">
          <form
            ref={formRef}
            onSubmit={handleSubmit(inputHandler)}
            id="chat-input-form"
          >
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-3 flex items-end gap-3 shadow-2xl focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all">
              <textarea
                id="chat-message-input"
                {...register("prompt", { required: true })}
                placeholder={
                  activeChat
                    ? `Message ContextGPT in ${activePreset?.label} mode...`
                    : `Message ${currentSelectedPreset?.label} to start this chat...`
                }
                rows={1}
                disabled={isTyping}
                className="flex-1 bg-transparent border-0 outline-none text-white text-xs sm:text-sm placeholder-zinc-500 resize-none max-h-40 leading-relaxed px-1"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(inputHandler)();
                  }
                }}
              />

              <button
                id="send-message-btn"
                type="submit"
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={isTyping}
                aria-label="Send message"
              >
                <i className="ri-send-plane-2-fill text-sm" />
              </button>
            </div>
          </form>

          <div className="text-center text-[11px] text-zinc-500 mt-2">
            {activeChat ? (
              <span>
                Active: <strong style={{ color: activePreset?.color || "#818cf8" }}>{activePreset?.label}</strong>
                {activeChat.customContext ? " (Custom Context Attached)" : ""} · Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Shift+Enter</kbd> for newline
              </span>
            ) : (
              <span>
                Selected Context: <strong style={{ color: currentSelectedPreset?.color || "#818cf8" }}>{currentSelectedPreset?.label}</strong> · Type a message above or click a preset card to start.
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
