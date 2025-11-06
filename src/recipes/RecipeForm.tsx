import { useState } from "react";
import axios from "axios";
import config from "../app/config"; // your backendUrl

function RecipeForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");

    // 1️⃣ Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // 2️⃣ Upload image
    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select an image first!");

        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await axios.post(
            `${config.backendUrl}/api/recipes/upload-image`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        setImageUrl(uploadRes.data.imageUrl); // store the uploaded path
        alert("Image uploaded successfully!");
    };

    // 3️⃣ Submit recipe
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newRecipe = {
            title,
            description,
            status: "Public",
            categoryIds: [1], // for now
            imageUrl, // from upload
        };

        await axios.post(`${config.backendUrl}/api/recipes`, newRecipe);
        alert("Recipe created successfully!");
    };

    return (
        <div className="container mt-4">
            <h2>Create New Recipe</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Description</label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label>Recipe Image</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-primary mt-2"
                        onClick={handleUpload}
                    >
                        Upload Image
                    </button>
                </div>

                {imageUrl && (
                    <div className="mb-3">
                        <img
                            src={`${config.backendUrl}${imageUrl}`}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ width: "200px" }}
                        />
                    </div>
                )}

                <button type="submit" className="btn btn-success">
                    Save Recipe
                </button>
            </form>
        </div>
    );
}

export default RecipeForm;
