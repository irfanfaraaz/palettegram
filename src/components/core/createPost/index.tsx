/* eslint-disable quotes */
import { useState } from "react";
import { Command, Image as NewImageFeather } from "react-feather";
import { addNewImage, savePostToDb, getImageUrl } from "@/backend/posts.api";
import Colorpicker from "@/components/core/colorPicker";
import Image from "next/image";
import { parseCookies } from "nookies";
import { toastify } from "@/helper/toastify";

const CHAR_LIMIT = 500;

// import logo from "../logo.svg";
const CreatePost = () => {
  // State to manage text field
  const [postTitle, setPostTitle] = useState("");

  // store image data
  const [imageStorage, setimageStorage] = useState<any>({
    preview: null,
    file: null,
  });

  // color palette toggle switch
  const [togglePalette, setTogglePalette] = useState(false);

  // colors grid
  const [colors, setColors] = useState({
    color01: "",
    color02: "",
    color03: "",
    color04: "",
  });

  const cookies = parseCookies();

  // const handleFileChange = (event: any) => {
  //   const fileObj = event.target.files && event.target.files[0];
  //   if (!fileObj) {
  //     return;
  //   }
  //   addNewImage(fileObj)
  //     .then((res) => {
  //       setPostImages((prev) => {
  //         return {
  //           ...prev,
  //           image01: `https://cloud.appwrite.io/v1/storage/buckets/${process.env.REACT_APP_BUCKET_ID}/files/${res?.$id}/view?project=64685bc4ecb8d4ee9f38&mode=admin`,
  //         };
  //       });
  //     })
  //     .catch((err) => console.log(err));
  // };

  // const handleClickDelete = (id: string) => {
  //   deleteImage(id)
  //     .then((res) => {
  //       setPostImages((prev) => {
  //         return {
  //           ...prev,
  //           image01: "",
  //           image02: "",
  //           image03: "",
  //           image04: "",
  //         };
  //       });
  //     })
  //     .catch((err) => console.log(err));
  // };

  const onChangeInput = (event: any) => {
    const { value } = event.target;
    setPostTitle(value);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    console.log(postTitle);
    console.log(imageStorage);
    console.log(cookies["userId"]);

    try {
      let imageURL: string = "";

      if (imageStorage && imageStorage.file) {
        const getFileObject = await addNewImage(imageStorage.file);

        if (!getFileObject) {
          throw new Error();
        }

        imageURL = getImageUrl(getFileObject["$id"])!;
      }

      const userIdFromCookies: string = cookies["userId"];

      const imageArray = [imageURL];

      const finalDataToUpload = {
        userId: userIdFromCookies,
        postTitle: postTitle,
        postImage: imageArray.length > 0 ? imageArray : [],
        colors: [],
        comments: [],
      };

      const savetoDb = await savePostToDb(finalDataToUpload);

      console.log(savetoDb);

      toastify("Post uploaded successfully", "success", false);
    } catch (error) {
      console.log(error);
    }

    // const newColors =
    //   colors.color01 !== null &&
    //   colors.color02 !== null &&
    //   colors.color03 !== null &&
    //   colors.color04 !== null
    //     ? colors
    //     : [];

    // const postData = {
    //   userId: localStorage.getItem("userId"),
    //   postTitle: postTitle,
    //   colors: Object.values(newColors),
    //   postImage: Object.values(postImages),
    // };

    // createPost(postData)
    //   .then((res) => {
    //     if (res) {
    //       setPostTitle("");
    //       setColors((prev: any) => {
    //         return {
    //           ...prev,
    //           color01: "",
    //           color02: "",
    //           color03: "",
    //           color04: "",
    //         };
    //       });
    //       setPostImages((prev) => {
    //         return {
    //           ...prev,
    //           image01: "",
    //           image02: "",
    //           image03: "",
    //           image04: "",
    //         };
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  /**
   * @work handles the file and convert it into base64 string
   * @param event
   */
  const handleFileUpload = async (event: any) => {
    const reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]);

    reader.onload = () => {
      if (reader.readyState === 2) {
        setimageStorage((prev: any) => {
          return {
            ...prev,
            preview: reader?.result,
            file: event.target.files[0],
          };
        });
      }
    };
  };

  const colorPaletteSwitch = () => {
    if (togglePalette) {
      setTogglePalette(false);
      setColors({
        color01: "",
        color02: "",
        color03: "",
        color04: "",
      });
    } else {
      setTogglePalette(true);
    }
  };

  return (
    <>
      <section className="border border-gray-500 rounded-md shadow-sm mb-4">
        <form className="p-4" method="post" onSubmit={handleSubmit}>
          <div className="mb-2">
            <small className="text-slate-400">Character limit is upto {CHAR_LIMIT}</small>

            <textarea
              onChange={onChangeInput}
              value={postTitle}
              name="postTitle"
              className="dark:bg-secondary-light outline-none focus:ring rounded-lg p-3 text-black dark:text-white placholder:text-gray-400 text-lg w-full mb-2"
              rows={4}
              cols={50}
              placeholder="What's happening?"
              maxLength={CHAR_LIMIT}
              required
            />
          </div>

          {togglePalette ? <Colorpicker colors={colors} setColors={setColors} /> : null}

          <article>
            {imageStorage && imageStorage.preview && (
              <Image
                src={imageStorage.preview}
                alt="user image"
                loading="lazy"
                width={600}
                height={200}
              />
            )}
          </article>

          <div className="flex flex-row justify-between items-center">
            <article className="flex flex-row gap-2">
              <input
                style={{ display: "none" }}
                type="file"
                id="uploadImage"
                accept="image/jpg, image/png, image/jpeg"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="uploadImage"
                className="transition-all duration-300 p-2 hover:bg-secondary-light hover:text-white rounded-full hover:cursor-pointer"
              >
                <NewImageFeather size={22} />
              </label>

              <button
                onClick={colorPaletteSwitch}
                className="transition-all duration-300 p-2 hover:bg-secondary-light hover:text-white rounded-full"
              >
                <Command size={22} />
              </button>
            </article>

            <article>
              <button
                type="submit"
                className="transition-all duration-300 bg-primary hover:bg-primary-light text-white font-normal py-1 px-8 rounded-full"
              >
                Post
              </button>
            </article>
          </div>
        </form>
      </section>
    </>
  );
};
export default CreatePost;

/*
<form onSubmit={handleSubmit} className="px-4 py-2 shadow-lg mb-4">
      <div className="flex">
        <div className="flex-1 ">
          <small className="text-slate-400">Character limit is upto 1000</small>
          <textarea
            onChange={onChangeInput}
            value={postTitle}
            name="postTitle"
            className="bg-transparent outline-none border focus:ring rounded-lg p-3 text-black placholder:text-gray-400 text-lg w-full mb-2"
            rows={3}
            cols={50}
            placeholder="What's happening?"
            maxLength={1000}
            required
          ></textarea>

          {togglePalette ? <Colorpicker colors={colors} setColors={setColors} /> : null}
        </div>
      </div>
      {postImages?.image01?.length > 0 ? (
        <Image
          className="w-full"
          src={postImages?.image01}
          alt="post"
          onClick={() => handleClickDelete(postImages?.image01.slice(72, 92))}
        />
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="flex items-center gap-3 group ">
            <input
              style={{ display: "none" }}
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <span
              className="p-2 rounded-full group-hover:bg-blue-800 group-hover:text-blue-300 flex justify-center items-center"
              onClick={handleClick}
            >
              <NewImageFeather />
            </span>
          </div>

          <div className="flex items-center gap-3 group ">
            <span
              onClick={() => setTogglePalette(!togglePalette)}
              className="p-2 rounded-full group-hover:bg-blue-800 group-hover:text-blue-300 flex justify-center items-center"
            >
              <Command />
            </span>
          </div>
        </div>

        <div className="">
          <button
            type="submit"
            className="primary hover:primary-light text-white font-bold py-2 px-8 rounded-full"
          >
            Post
          </button>
        </div>
      </div>
    </form>

*/
