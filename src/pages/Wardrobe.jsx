import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const categories = [
  "Jeans",
  "Shirts",
  "Jackets",
  "T-Shirts",
  "Traditional Wear",
];

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Jeans");
  const [user, setUser] = useState(null);

  // -------------------------------
  // LOAD USER
  // -------------------------------
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) fetchWardrobeItems(data.user.id);
    }
    getUser();
  }, []);

  // -------------------------------
  // FETCH ITEMS FROM DB
  // -------------------------------
  async function fetchWardrobeItems(userId) {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      toast.error("Failed to fetch wardrobe");
    } else {
      setItems(data);
    }
  }

  // -------------------------------
  // UPLOAD FILE + SAVE TO DB
  // -------------------------------
  const handleFileUpload = async (event, category) => {
    const files = event.target.files;
    if (!files || !user) return;

    for (let file of files) {
      const filePath = `${user.id}/${category}/${Date.now()}-${file.name}`;

      // Upload to Storage
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("wardrobe")
        .upload(filePath, file);

      if (uploadErr) {
        toast.error("Upload failed!");
        console.error(uploadErr);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("wardrobe")
        .getPublicUrl(filePath);

      // Save record in database
      const { data: insertData, error: insertErr } = await supabase
        .from("wardrobe_items")
        .insert({
          user_id: user.id,
          category,
          name: file.name.replace(/\.[^/.]+$/, ""),
          image_url: urlData.publicUrl,
          storage_path: filePath,
        })
        .select("*")
        .single();

      if (insertErr) {
        console.error(insertErr);
        toast.error("Failed to save item in wardrobe");
      } else {
        setItems((prev) => [...prev, insertData]);
        toast.success(`Added ${file.name}`);
      }
    }
  };

  // -------------------------------
  // DELETE ITEM
  // -------------------------------
  const removeItem = async (item) => {
    // Delete from storage
    await supabase.storage.from("wardrobe").remove([item.storage_path]);

    // Delete from db
    await supabase.from("wardrobe_items").delete().eq("id", item.id);

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success("Item removed");
  };

  const filteredItems = items.filter(
    (item) => item.category === activeCategory
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">My Wardrobe</h1>
          <p className="text-muted-foreground">
            Upload and organize your clothing items by category
          </p>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {category} (
                  {items.filter((i) => i.category === category).length})
                </h2>

                <div>
                  <input
                    id={`upload-${category}`}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, category)}
                  />

                  <Button
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => {
                      document.getElementById(`upload-${category}`).click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Items
                  </Button>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <Card className="p-12 text-center gradient-card">
                  <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your first {category.toLowerCase()} to get started
                  </p>
                  <div>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        document.getElementById(`upload-${category}`).click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Now
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden transition-smooth hover:shadow-hover group"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth"
                          onClick={() => removeItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{item.name}</h3>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
