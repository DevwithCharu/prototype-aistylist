import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
 function OutfitRecommendation() {
  const [user, setUser] = useState(null);

  const [gender, setGender] = useState("");
  const [occasion, setOccasion] = useState("");

  const [skinTone, setSkinTone] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [colorsText, setColorsText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function uploadImage(file) {
    const path = `${user.id}/reference/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("uploads").upload(path, file);

    if (error) throw error;

    return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
  }

  async function handleGenerate(e) {
    e.preventDefault();

    if (!user) return toast.error("Please login");

    setLoading(true);

    try {
      let image_url = null;
      if (imageFile) image_url = await uploadImage(imageFile);

      const payload = {
        gender,
        occasion,
        skinTone,
        bodyType,
        colors: colorsText.split(",").map((c) => c.trim()),
        image_url,
      };

      const resp = await supabase.functions.invoke("recommend", {
        body: JSON.stringify(payload),
      });

      if (resp.error) throw resp.error;

      setResults(resp.data.recommendations || []);
      toast.success("Outfits Ready!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
  <div className="container mx-auto p-6">

    <h1 className="text-3xl font-bold mb-8">Customize Your Outfit</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

      {/* LEFT SIDE FORM */}
      <div>
        <form onSubmit={handleGenerate} className="space-y-4">

          <label>
            Gender
            <select className="border p-2 w-full" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </label>

          <label>
            Occasion
            <select className="border p-2 w-full" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              <option value="">Select</option>
              <option>Casual</option>
              <option>Office</option>
              <option>Party</option>
              <option>Wedding</option>
            </select>
          </label>

          <label>
            Skin Tone
            <select className="border p-2 w-full" value={skinTone} onChange={(e) => setSkinTone(e.target.value)}>
              <option value="">Select</option>
              <option>Warm</option>
              <option>Cool</option>
              <option>Neutral</option>
            </select>
          </label>

          <label>
            Body Type
            <select className="border p-2 w-full" value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
              <option value="">Select</option>
              <option>Pear</option>
              <option>Apple</option>
              <option>Rectangle</option>
              <option>Hourglass</option>
            </select>
          </label>

          <label>
            Favorite Colors
            <Input
              value={colorsText}
              onChange={(e) => setColorsText(e.target.value)}
              placeholder="navy, olive, maroon"
            />
          </label>

          <label>
            Optional Image (reference)
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>

          <Button disabled={loading}>
            {loading ? "Generating..." : "Generate Outfits"}
          </Button>

        </form>
      </div>

      {/* RIGHT SIDE – ALWAYS VISIBLE OUTFITS */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Outfits</h2>

        {results.length === 0 && (
          <p className="text-gray-500">No outfits yet. Fill the form and generate!</p>
        )}

        {results.map((outfit, idx) => (
          <div key={idx} className="mb-8 p-5 border rounded-lg shadow">

            {/* SLIDER FIXED WIDTH */}
           <Slider
  dots={true}
  infinite={true}
  speed={400}
  slidesToShow={1}
  slidesToScroll={1}
>
  {/* If backend returned images array */}
  {Array.isArray(outfit.images) && outfit.images.length > 0 ? (
    outfit.images.map((img, i) => (
      <img
        key={i}
        src={img}
        className="w-full h-72 object-cover rounded-lg"
        onError={(e) => (e.target.style.display = "none")}
      />
    ))
  ) : (
    /* Fallback single image */
    <img
      src={outfit.image || "/placeholder.jpg"}
      className="w-full h-72 object-cover rounded-lg"
    />
  )}
</Slider>


            <h3 className="text-xl font-semibold mt-3">{outfit.title}</h3>
            <p className="text-gray-600">{outfit.description}</p>

            <ul className="mt-3 list-disc ml-6 text-sm">
              {outfit.items?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default OutfitRecommendation;