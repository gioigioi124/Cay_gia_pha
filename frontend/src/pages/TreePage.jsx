import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Users, GitBranchPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TreeCanvas from "@/components/tree/TreeCanvas";
import MemberForm from "@/components/member/MemberForm";
import MemberCard from "@/components/member/MemberCard";
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
    selectedMember,
    isLoading: memberLoading,
    fetchMembers,
    createMember,
    editMember,
    removeMember,
    selectMember,
    clearSelection,
  } = useMemberStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewMode, setViewMode] = useState("tree"); // 'tree' or 'list'

  useEffect(() => {
    if (treeId) {
      fetchTree(treeId);
      fetchMembers(treeId);
    }
  }, [treeId, fetchTree, fetchMembers]);

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

  const handleNodeClick = (member) => {
    selectMember(member);
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingMember(null);
    clearSelection();
    setIsFormOpen(true);
  };

  if (treeLoading) return <LoadingSpinner text="Đang tải cây gia phả..." />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`px-3 py-1.5 text-sm ${viewMode === "tree" ? "bg-emerald-500 text-white" : "bg-background hover:bg-muted"}`}
                onClick={() => setViewMode("tree")}
              >
                <GitBranchPlus className="h-4 w-4" />
              </button>
              <button
                className={`px-3 py-1.5 text-sm ${viewMode === "list" ? "bg-emerald-500 text-white" : "bg-background hover:bg-muted"}`}
                onClick={() => setViewMode("list")}
              >
                <Users className="h-4 w-4" />
              </button>
            </div>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={openAddForm}
            >
              <Plus className="h-4 w-4" />
              Thêm Thành Viên
            </Button>
          </div>
        </div>

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
        ) : viewMode === "tree" ? (
          <TreeCanvas members={members} onNodeClick={handleNodeClick} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                onClick={handleNodeClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Member Form Dialog */}
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
    </div>
  );
};

export default TreePage;
