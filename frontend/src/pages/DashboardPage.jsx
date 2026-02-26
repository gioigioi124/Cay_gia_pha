import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TreePine, Trash2, Edit, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/common/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useTreeStore from "@/store/useTreeStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import dayjs from "dayjs";

const DashboardPage = () => {
  const { isAuthenticated } = useAuth();
  const { trees, isLoading, fetchTrees, addTree, removeTree } = useTreeStore();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const [newTreeDesc, setNewTreeDesc] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchTrees();
    }
  }, [isAuthenticated, fetchTrees]);

  const handleCreateTree = async (e) => {
    e.preventDefault();
    if (!newTreeName.trim()) return;

    try {
      await addTree({ name: newTreeName, description: newTreeDesc });
      toast.success("Tạo cây gia phả thành công!");
      setNewTreeName("");
      setNewTreeDesc("");
      setIsCreateOpen(false);
    } catch {
      toast.error("Không thể tạo cây gia phả");
    }
  };

  const handleDeleteTree = async (e, treeId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa cây gia phả này?")) return;

    try {
      await removeTree(treeId);
      toast.success("Đã xóa cây gia phả");
    } catch {
      toast.error("Không thể xóa cây gia phả");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cây Gia Phả Của Bạn</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và xem các cây gia phả gia đình
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="h-4 w-4" />
                Tạo Cây Mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo Cây Gia Phả Mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin để bắt đầu xây dựng cây gia phả
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTree} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="treeName">Tên cây gia phả</Label>
                  <Input
                    id="treeName"
                    placeholder='Ví dụ: "Gia phả họ Nguyễn"'
                    value={newTreeName}
                    onChange={(e) => setNewTreeName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treeDesc">Mô tả (tùy chọn)</Label>
                  <Input
                    id="treeDesc"
                    placeholder="Mô tả ngắn về cây gia phả"
                    value={newTreeDesc}
                    onChange={(e) => setNewTreeDesc(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Tạo Cây
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Trees Grid */}
        {isLoading ? (
          <LoadingSpinner text="Đang tải cây gia phả..." />
        ) : trees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <TreePine className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Chưa có cây gia phả nào
            </h2>
            <p className="text-muted-foreground mt-1">
              Bắt đầu bằng cách tạo cây gia phả đầu tiên
            </p>
            <Button
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Tạo Cây Gia Phả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map((tree) => (
              <Card
                key={tree._id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-emerald-500/50 border-border/40 group"
                onClick={() => navigate(`/tree/${tree._id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <TreePine className="h-5 w-5 text-emerald-500" />
                      </div>
                      <CardTitle className="text-lg">{tree.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={(e) => handleDeleteTree(e, tree._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {tree.description && (
                    <CardDescription className="mt-1">
                      {tree.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{tree.members?.length || 0} thành viên</span>
                    </div>
                    <span>{dayjs(tree.createdAt).format("DD/MM/YYYY")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
