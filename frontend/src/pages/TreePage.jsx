import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Users,
  GitBranchPlus,
  Search,
  X,
  Link2,
  Pencil,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Navbar from "@/components/common/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TreeCanvas from "@/components/tree/TreeCanvas";
import TreeStats from "@/components/tree/TreeStats";
import EditTreeModal from "@/components/tree/EditTreeModal";
import MemberForm from "@/components/member/MemberForm";
import MemberCard from "@/components/member/MemberCard";
import MemberDetailDrawer from "@/components/member/MemberDetailDrawer";
import RelationshipForm from "@/components/member/RelationshipForm";
import useTreeStore from "@/store/useTreeStore";
import useMemberStore from "@/store/useMemberStore";
import { useAuth } from "@/hooks/useAuth";
import { exportToPDF, exportMemberListToPDF } from "@/utils/exportPDF";
import { toast } from "sonner";

const TreePage = () => {
  useAuth();
  const { id: treeId } = useParams();
  const navigate = useNavigate();

  const {
    currentTree,
    fetchTree,
    updateTree,
    isLoading: treeLoading,
  } = useTreeStore();
  const {
    members,
    isLoading: memberLoading,
    fetchMembers,
    createMember,
    editMember,
    removeMember,
    createRelationship,
  } = useMemberStore();

  // UI state
  const [viewMode, setViewMode] = useState("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Modals
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isEditTreeOpen, setIsEditTreeOpen] = useState(false);
  const [isRelFormOpen, setIsRelFormOpen] = useState(false);
  const [relFormInitialValues, setRelFormInitialValues] = useState(null);

  // Detail drawer
  const [drawerMember, setDrawerMember] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (treeId) {
      fetchTree(treeId);
      fetchMembers(treeId);
    }
  }, [treeId, fetchTree, fetchMembers]);

  // Search filter
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.birthPlace?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  // --- Handlers ---

  const handleAddMember = async (data) => {
    try {
      await createMember(treeId, data);
      toast.success("Thêm thành viên thành công!");
      setIsMemberFormOpen(false);
    } catch {
      toast.error("Không thể thêm thành viên");
    }
  };

  const handleEditMember = async (data) => {
    try {
      await editMember(treeId, editingMember._id, data);
      toast.success("Cập nhật thành viên thành công!");
      setEditingMember(null);
      setIsMemberFormOpen(false);
    } catch {
      toast.error("Không thể cập nhật thành viên");
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    try {
      await removeMember(treeId, memberId);
      toast.success("Đã xóa thành viên");
    } catch {
      toast.error("Không thể xóa thành viên");
    }
  };

  const handleAddRelationship = async ({
    memberId,
    relatedMemberId,
    type,
    marriageDate,
  }) => {
    try {
      await createRelationship(treeId, memberId, {
        type,
        relatedMemberId,
        marriageDate,
      });
      // Refresh members to get updated relationships
      await fetchMembers(treeId);
      toast.success("Thêm quan hệ thành công!");
      setIsRelFormOpen(false);
    } catch {
      toast.error("Không thể thêm quan hệ");
    }
  };

  const handleRemoveRelationship = async (memberId, relatedMemberId) => {
    try {
      await useMemberStore
        .getState()
        .removeRelationship(treeId, memberId, relatedMemberId);
      toast.success("Đã xóa quan hệ thành công");
      // Update drawer member data if still open
      const updatedMembers = useMemberStore.getState().members;
      const m = updatedMembers.find((x) => x._id === memberId);
      if (m) setDrawerMember(m);
    } catch {
      toast.error("Không thể xóa quan hệ");
    }
  };

  const handleEditTree = async (data) => {
    try {
      await updateTree(treeId, data);
      toast.success("Cập nhật thông tin cây thành công!");
      setIsEditTreeOpen(false);
    } catch {
      toast.error("Không thể cập nhật thông tin cây");
    }
  };

  // Click node → open drawer
  const handleNodeClick = (member) => {
    setDrawerMember(member);
    setIsDrawerOpen(true);
  };

  const handleConnectNodes = (connection) => {
    let type = "parent";
    // Infer relationship type based on handle used: side handles -> spouse
    if (
      ["left", "right"].includes(connection.sourceHandle) ||
      ["left", "right"].includes(connection.targetHandle)
    ) {
      type = "spouse";
    }

    setRelFormInitialValues({
      memberId: connection.source,
      relatedMemberId: connection.target,
      type,
    });
    setIsRelFormOpen(true);
  };

  const handleCardClick = (member) => {
    setDrawerMember(member);
    setIsDrawerOpen(true);
  };

  const handleDrawerEdit = (member) => {
    setEditingMember(member);
    setIsMemberFormOpen(true);
  };

  const handleSelectRelative = (memberId) => {
    const found = members.find((m) => m._id === memberId);
    if (found) setDrawerMember(found);
  };

  const handleExportCanvasPDF = async () => {
    if (viewMode !== "tree") {
      setViewMode("tree");
      await new Promise((r) => setTimeout(r, 300));
    }
    setIsExporting(true);
    try {
      const safeName = (currentTree?.name || "gia-pha")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      await exportToPDF("tree-canvas-export", safeName, {
        orientation: "landscape",
      });
      toast.success("Đã xuất PDF cây gia phả!");
    } catch (e) {
      toast.error("Không thể xuất PDF: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportListPDF = async () => {
    setIsExporting(true);
    try {
      exportMemberListToPDF(members, currentTree?.name || "Gia Phả");
      toast.success("Đã xuất danh sách PDF!");
    } catch (e) {
      toast.error("Không thể xuất PDF: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const openAddForm = () => {
    setEditingMember(null);
    setIsMemberFormOpen(true);
  };

  if (treeLoading) return <LoadingSpinner text="Đang tải cây gia phả..." />;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-0 container mx-auto px-4 py-4">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {currentTree?.name || "Cây Gia Phả"}
                </h1>
                <button
                  title="Sửa tên cây"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsEditTreeOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {/* Stats toggle — sits right next to the tree name */}
                <TreeStats
                  members={members}
                  triggerOnly
                  open={isStatsOpen}
                  onToggle={() => setIsStatsOpen((v) => !v)}
                />
              </div>
              {currentTree?.description && (
                <p className="text-sm text-muted-foreground">
                  {currentTree.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="member-search"
                placeholder="Tìm thành viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 w-48"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                title="Dạng cây"
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "tree"
                    ? "bg-emerald-500 text-white"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setViewMode("tree")}
              >
                <GitBranchPlus className="h-4 w-4" />
              </button>
              <button
                title="Dạng danh sách"
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-emerald-500 text-white"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setViewMode("list")}
              >
                <Users className="h-4 w-4" />
              </button>
            </div>

            {/* Export PDF */}
            {members.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9"
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Đang xuất..." : "Xuất PDF"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCanvasPDF}>
                    <GitBranchPlus className="mr-2 h-4 w-4 text-emerald-500" />
                    Xuất sơ đồ cây
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportListPDF}>
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    Xuất danh sách thành viên
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Add relationship */}
            {members.length >= 2 && (
              <Button
                variant="outline"
                className="gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() => {
                  setRelFormInitialValues(null);
                  setIsRelFormOpen(true);
                }}
              >
                <Link2 className="h-4 w-4" />
                Quan Hệ
              </Button>
            )}

            {/* Add member */}
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={openAddForm}
            >
              <Plus className="h-4 w-4" />
              Thêm Thành Viên
            </Button>
          </div>
        </div>

        {/* ── Stats panel (collapsible, controlled by header button) ── */}
        {isStatsOpen && (
          <div className="mb-3">
            <TreeStats
              members={members}
              open={isStatsOpen}
              onToggle={() => setIsStatsOpen((v) => !v)}
            />
          </div>
        )}

        {/* Search info */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-3">
            Tìm thấy{" "}
            <span className="font-medium text-foreground">
              {filteredMembers.length}
            </span>{" "}
            kết quả trong {members.length} thành viên
          </p>
        )}

        {/* ── Main content — fills remaining height, scrolls internally ── */}
        <div className="flex-1 min-h-0 rounded-xl border border-border/40 bg-card overflow-hidden">
          {memberLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner text="Đang tải thành viên..." />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-muted-foreground">
                Chưa có thành viên
              </h2>
              <p className="text-muted-foreground mt-1">
                Bắt đầu bằng cách thêm thành viên đầu tiên
              </p>
              <Button
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 gap-2"
                onClick={openAddForm}
              >
                <Plus className="h-4 w-4" />
                Thêm Ngay
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Không tìm thấy thành viên nào
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSearchQuery("")}
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : viewMode === "tree" ? (
            /* Tree canvas fills the container exactly */
            <TreeCanvas
              members={searchQuery ? filteredMembers : members}
              onNodeClick={handleNodeClick}
              onConnectNodes={handleConnectNodes}
            />
          ) : (
            /* List view: scrollable grid inside the container */
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMembers.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <MemberForm
        isOpen={isMemberFormOpen}
        onClose={() => {
          setIsMemberFormOpen(false);
          setEditingMember(null);
        }}
        onSubmit={editingMember ? handleEditMember : handleAddMember}
        member={editingMember}
        isLoading={memberLoading}
      />

      <MemberDetailDrawer
        member={drawerMember}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleDrawerEdit}
        onDelete={handleDeleteMember}
        onSelectMember={handleSelectRelative}
        onRemoveRelationship={handleRemoveRelationship}
        onAvatarUpdate={(updatedMember) => {
          fetchMembers(treeId);
          setDrawerMember(updatedMember);
        }}
      />

      <RelationshipForm
        isOpen={isRelFormOpen}
        onClose={() => {
          setIsRelFormOpen(false);
          setRelFormInitialValues(null);
        }}
        onSubmit={handleAddRelationship}
        members={members}
        isLoading={memberLoading}
        initialValues={relFormInitialValues}
      />

      <EditTreeModal
        isOpen={isEditTreeOpen}
        onClose={() => setIsEditTreeOpen(false)}
        tree={currentTree}
        onSave={handleEditTree}
        isLoading={treeLoading}
      />
    </div>
  );
};

export default TreePage;
