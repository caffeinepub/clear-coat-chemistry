import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  KeyRound,
  Loader2,
  Package,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { AuthWall } from "../components/AuthWall";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useAllOrders,
  useAllProducts,
  useDeleteProduct,
  useIsAdmin,
  useSetupAdmin,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import {
  formatDate,
  formatPrice,
  getCategoryBadgeClass,
} from "../lib/productImages";

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0n,
  stock: 0n,
  category: "Washing",
  imageUrl: "",
  featured: false,
};

const CATEGORIES_LIST = ["Washing", "Polishing", "Interior", "Accessories"];
const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50";
    case "processing":
      return "bg-blue-900/50 text-blue-300 border-blue-700/50";
    case "shipped":
      return "bg-purple-900/50 text-purple-300 border-purple-700/50";
    case "delivered":
      return "bg-green-900/50 text-green-300 border-green-700/50";
    case "cancelled":
      return "bg-red-900/50 text-red-300 border-red-700/50";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useAllProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const setupAdmin = useSetupAdmin();

  const [adminSecret, setAdminSecret] = useState("");

  const [productDialog, setProductDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    product: Omit<Product, "id"> & { id?: bigint };
  }>({
    open: false,
    mode: "add",
    product: { ...EMPTY_PRODUCT },
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  if (!identity) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <AuthWall message="Sign in to access the admin dashboard." />
      </main>
    );
  }

  if (checkingAdmin) {
    return (
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    const handleClaimAdmin = async () => {
      if (!adminSecret.trim()) {
        toast.error("Please enter your admin secret");
        return;
      }
      try {
        await setupAdmin.mutateAsync({ secret: adminSecret });
        toast.success("Admin access granted! Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error("Invalid secret or admin already assigned");
      }
    };

    return (
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border/50 rounded-2xl p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Admin Access Required
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your admin secret to unlock the dashboard. You can find this
              in your Caffeine project settings under Environment Variables
              (CAFFEINE_ADMIN_TOKEN).
            </p>
            <div className="space-y-3 text-left">
              <Label className="text-foreground text-sm">Admin Secret</Label>
              <Input
                type="password"
                placeholder="Enter your admin secret..."
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClaimAdmin()}
                data-ocid="admin.secret.input"
                className="bg-secondary/50 border-border/50"
              />
              <Button
                onClick={handleClaimAdmin}
                disabled={setupAdmin.isPending}
                data-ocid="admin.claim.submit_button"
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {setupAdmin.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Claim Admin Access
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  const handleOpenAddProduct = () => {
    setProductDialog({
      open: true,
      mode: "add",
      product: { ...EMPTY_PRODUCT },
    });
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductDialog({
      open: true,
      mode: "edit",
      product: { ...product },
    });
  };

  const handleSaveProduct = async () => {
    const p = productDialog.product;
    if (!p.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    try {
      const productData: Product = {
        id: p.id ?? 0n,
        name: p.name,
        description: p.description,
        price: BigInt(Math.round(Number(p.price))),
        stock: BigInt(Math.round(Number(p.stock))),
        category: p.category,
        imageUrl: p.imageUrl,
        featured: p.featured,
      };

      if (productDialog.mode === "add") {
        await addProduct.mutateAsync({ product: productData });
        toast.success("Product added successfully");
      } else if (p.id !== undefined) {
        await updateProduct.mutateAsync({ id: p.id, product: productData });
        toast.success("Product updated successfully");
      }
      setProductDialog((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteDialog.product) return;
    try {
      await deleteProduct.mutateAsync({ id: deleteDialog.product.id });
      toast.success("Product deleted");
      setDeleteDialog({ open: false, product: null });
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId: bigint, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  return (
    <main className="flex-1 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage products, orders, and inventory
          </p>
        </motion.div>

        <Tabs defaultValue="products">
          <TabsList className="bg-secondary/50 mb-6" data-ocid="admin.tabs">
            <TabsTrigger
              value="products"
              data-ocid="admin.products.tab"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders.tab"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ClipboardList className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-foreground">
                All Products ({products?.length ?? 0})
              </h2>
              <Button
                onClick={handleOpenAddProduct}
                data-ocid="admin.product.open_modal_button"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {productsLoading ? (
              <div
                className="space-y-3"
                data-ocid="admin.products.loading_state"
              >
                {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                  <Skeleton key={sk} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden lg:table-cell">
                        Stock
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden lg:table-cell">
                        Featured
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!products || products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="admin.products.empty_state"
                        >
                          No products yet. Add your first product.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product, index) => (
                        <TableRow
                          key={product.id.toString()}
                          data-ocid={`admin.product.row.${index + 1}`}
                          className="border-border/50 hover:bg-secondary/20"
                        >
                          <TableCell className="font-medium text-foreground">
                            {product.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getCategoryBadgeClass(product.category)}`}
                            >
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-foreground">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-foreground">
                            {product.stock.toString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {product.featured ? (
                              <Badge className="bg-primary/20 text-primary text-xs border border-primary/30">
                                Featured
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => handleOpenEditProduct(product)}
                                data-ocid={`admin.product.edit_button.${index + 1}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  setDeleteDialog({ open: true, product })
                                }
                                data-ocid={`admin.product.delete_button.${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-4">
              <h2 className="font-display font-bold text-xl text-foreground">
                All Orders ({orders?.length ?? 0})
              </h2>
            </div>

            {ordersLoading ? (
              <div className="space-y-3" data-ocid="admin.orders.loading_state">
                {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                  <Skeleton key={sk} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Order ID
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">
                        Total
                      </TableHead>
                      <TableHead className="text-muted-foreground hidden lg:table-cell">
                        Items
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!orders || orders.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="admin.orders.empty_state"
                        >
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders
                        .slice()
                        .sort(
                          (a, b) => Number(b.createdAt) - Number(a.createdAt),
                        )
                        .map((order, index) => (
                          <TableRow
                            key={order.id.toString()}
                            data-ocid={`admin.order.row.${index + 1}`}
                            className="border-border/50 hover:bg-secondary/20"
                          >
                            <TableCell className="font-mono text-sm text-foreground">
                              #{order.id.toString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-semibold text-foreground">
                              {formatPrice(order.total)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(val) =>
                                  handleUpdateOrderStatus(order.id, val)
                                }
                              >
                                <SelectTrigger
                                  className="h-8 w-36 border-border/50 text-xs"
                                  data-ocid={`admin.order.status.select.${index + 1}`}
                                >
                                  <SelectValue>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs capitalize ${getStatusBadgeClass(order.status)}`}
                                    >
                                      {order.status}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((s) => (
                                    <SelectItem
                                      key={s}
                                      value={s}
                                      className="text-xs capitalize"
                                    >
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <Dialog
          open={productDialog.open}
          onOpenChange={(open) =>
            setProductDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent
            className="bg-card border-border/50 max-w-lg"
            data-ocid="admin.product.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                {productDialog.mode === "add"
                  ? "Add New Product"
                  : "Edit Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-foreground text-sm mb-1.5 block">
                    Name *
                  </Label>
                  <Input
                    placeholder="Product name"
                    value={productDialog.product.name}
                    onChange={(e) =>
                      setProductDialog((prev) => ({
                        ...prev,
                        product: { ...prev.product, name: e.target.value },
                      }))
                    }
                    data-ocid="admin.product.name.input"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm mb-1.5 block">
                    Price (cents)
                  </Label>
                  <Input
                    type="number"
                    placeholder="1999"
                    value={productDialog.product.price.toString()}
                    onChange={(e) =>
                      setProductDialog((prev) => ({
                        ...prev,
                        product: {
                          ...prev.product,
                          price: BigInt(e.target.value || "0"),
                        },
                      }))
                    }
                    data-ocid="admin.product.price.input"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm mb-1.5 block">
                    Stock
                  </Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={productDialog.product.stock.toString()}
                    onChange={(e) =>
                      setProductDialog((prev) => ({
                        ...prev,
                        product: {
                          ...prev.product,
                          stock: BigInt(e.target.value || "0"),
                        },
                      }))
                    }
                    data-ocid="admin.product.stock.input"
                    className="bg-secondary/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-foreground text-sm mb-1.5 block">
                    Category
                  </Label>
                  <Select
                    value={productDialog.product.category}
                    onValueChange={(v) =>
                      setProductDialog((prev) => ({
                        ...prev,
                        product: { ...prev.product, category: v },
                      }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="admin.product.category.select"
                      className="bg-secondary/50 border-border/50"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES_LIST.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={productDialog.product.featured}
                    onChange={(e) =>
                      setProductDialog((prev) => ({
                        ...prev,
                        product: {
                          ...prev.product,
                          featured: e.target.checked,
                        },
                      }))
                    }
                    data-ocid="admin.product.featured.checkbox"
                    className="rounded"
                  />
                  <Label
                    htmlFor="featured"
                    className="text-foreground text-sm cursor-pointer"
                  >
                    Featured product
                  </Label>
                </div>
                <div className="col-span-2">
                  <Label className="text-foreground text-sm mb-1.5 block">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Product description…"
                    value={productDialog.product.description}
                    onChange={(e) =>
                      setProductDialog((prev) => ({
                        ...prev,
                        product: {
                          ...prev.product,
                          description: e.target.value,
                        },
                      }))
                    }
                    data-ocid="admin.product.description.textarea"
                    className="bg-secondary/50 border-border/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setProductDialog((prev) => ({ ...prev, open: false }))
                }
                data-ocid="admin.product.cancel.button"
                className="border-border/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                disabled={addProduct.isPending || updateProduct.isPending}
                data-ocid="admin.product.save.button"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {(addProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {productDialog.mode === "add" ? "Add Product" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent
            className="bg-card border-border/50 max-w-sm"
            data-ocid="admin.delete.dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                Delete Product
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteDialog.product?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, product: null })}
                data-ocid="admin.delete.cancel.button"
                className="border-border/50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
                disabled={deleteProduct.isPending}
                data-ocid="admin.delete.confirm.button"
                className="gap-2"
              >
                {deleteProduct.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
