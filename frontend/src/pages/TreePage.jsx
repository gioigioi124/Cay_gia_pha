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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/common/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TreeCanvas from "@/components/tree/TreeCanvas";
import MemberForm from "@/components/member/MemberForm";
import MemberCard from "@/components/member/MemberCard";
import MemberDetailDrawer from "@/components/member/MemberDetailDrawer";
import RelationshipForm from "@/components/member/RelationshipForm";
import useTreeStore from "@/store/useTreeStore";
import useMemberStore from "@/store/useMemberStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TreePage = () => {
  useAuth();
  const { id: treeId } = useParams();
  const navigate = useNavigate();
  const { currentTree, fetchTree, isLoading: treeLoading } = useTreeStore();
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
  const [viewMode, setViewMode] = useState("tree"); // 'tree' | 'list'
  const [searchQuery, setSearchQuery] = useState("");

  // Member form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Detail drawer
  const [drawerMember, setDrawerMember] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Relationship form
  const [isRelFormOpen, setIsRelFormOpen] = useState(false);

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
      setIsFormOpen(false);
    } catch {
      toast.error("Không thể thêm thành viên");
    }
  };

  const handleEditMember = async (data) => {
    try {
      await editMember(treeId, editingMember._id, data);
      toast.success("Cập nhật thành viên thành công!");
      setEditingMember(null);
      setIsFormOpen(false);
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
      toast.success("Thêm quan hệ thành công!");
      setIsRelFormOpen(false);
    } catch {
      toast.error("Không thể thêm quan hệ");
    }
  };

  // Click node on canvas → open drawer
  const handleNodeClick = (member) => {
    setDrawerMember(member);
    setIsDrawerOpen(true);
  };

  // Click member card in list → open drawer
  const handleCardClick = (member) => {
    setDrawerMember(member);
    setIsDrawerOpen(true);
  };

  // From drawer: edit
  const handleDrawerEdit = (member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  // Navigate to a relative by ID (from drawer links)
  const handleSelectRelative = (memberId) => {
    const found = members.find((m) => m._id === memberId);
    if (found) {
      setDrawerMember(found);
    }
  };

  const openAddForm = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  if (treeLoading) return <LoadingSpinner text="Đang tải cây gia phả..." />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {currentTree?.name || "Cây Gia Phả"}
              </h1>
              {currentTree?.description && (
                <p className="text-sm text-muted-foreground">
                  {currentTree.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search bar */}
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
                title="Xem dạng cây"
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === "tree"
                    ? "bg-emerald-500 text-white"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setViewMode("tree")}
              >
                <GitBranchPlus className="h-4 w-4" />
              </button>
              <button
                title="Xem dạng danh sách"
                className={`px-3 py-1.5 text-sm transition-colors ${
                  viewMode === "list"
                    ? "bg-emerald-500 text-white"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setViewMode("list")}
              >
                <Users className="h-4 w-4" />
              </button>
            </div>

            {/* Add relationship button */}
            {members.length >= 2 && (
              <Button
                variant="outline"
                className="gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() => setIsRelFormOpen(true)}
              >
                <Link2 className="h-4 w-4" />
                Thêm Quan Hệ
              </Button>
            )}

            {/* Add member button */}
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={openAddForm}
            >
              <Plus className="h-4 w-4" />
              Thêm Thành Viên
            </Button>
          </div>
        </div>

        {/* Search result count */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            Tìm thấy{" "}
            <span className="font-medium text-foreground">
              {filteredMembers.length}
            </span>{" "}
            kết quả
            {filteredMembers.length !== members.length &&
              ` trong ${members.length} thành viên`}
          </p>
        )}

        {/* Content */}
        {memberLoading ? (
          <LoadingSpinner text="Đang tải thành viên..." />
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Chưa có thành viên nào
            </h2>
            <p className="text-muted-foreground mt-1">
              Bắt đầu bằng cách thêm thành viên đầu tiên
            </p>
            <Button
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={openAddForm}
            >
              <Plus className="h-4 w-4" />
              Thêm Thành Viên Đầu Tiên
            </Button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
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
          <TreeCanvas
            members={searchQuery ? filteredMembers : members}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Member Add/Edit Form */}
      <MemberForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
        }}
        onSubmit={editingMember ? handleEditMember : handleAddMember}
        member={editingMember}
        isLoading={memberLoading}
      />

      {/* Member Detail Drawer */}
      <MemberDetailDrawer
        member={drawerMember}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleDrawerEdit}
        onDelete={handleDeleteMember}
        onSelectMember={handleSelectRelative}
      />

      {/* Relationship Form */}
      <RelationshipForm
        isOpen={isRelFormOpen}
        onClose={() => setIsRelFormOpen(false)}
        onSubmit={handleAddRelationship}
        members={members}
        isLoading={memberLoading}
      />
    </div>
  );
};

export default TreePage;
