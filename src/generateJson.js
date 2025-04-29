import axios from "axios";
import fs from "fs/promises";
import path from "path";

const generateJson = async () => {
  // Path to the messages folder
  const filePath = path.join(process.cwd(), "messages", "en.json");

  try {
    // Check if the file exists
    await fs.access(filePath);

    // If the file exists, delete it
    await fs.unlink(filePath);

    console.log("File deleted, fetching new data...");

    //**function to convert the data into desired format */
    function transformData(data) {
      const result = {};

      data.forEach((item) => {
        // Initialize the parent key
        result[item.key] = {};

        // Loop through child items to add them as key-value pairs
        item.child.forEach((child) => {
          result[item.key][child.key] = child.english_value;
        });
        item.messages.forEach((err) => {
          result[item.key][err.error_code] = err.english_value;
        });
      });

      return result;
    }

    // Proceed to fetch data and write to file
    let dataLabel;
    try {
      const res = await axios.post(
        `https://devcrmapi.digivarsity.com/common/get_label_list`
      );
      dataLabel = transformData(res.data);
    } catch (error) {
      console.log("apihiterr", error);
    }

    // Ensure the 'messages' folder exists, create if not
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the fetched JSON data to the file
    await fs.writeFile(filePath, JSON.stringify(dataLabel));

    return new Response("file created after deletion", { status: 200 });
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, fetch the data from the external API
      try {
        //**function to convert the data into desired format */
        function transformData(data) {
          const result = {};

          data.forEach((item) => {
            // Initialize the parent key
            result[item.key] = {};

            // Loop through child items to add them as key-value pairs
            item.child.forEach((child) => {
              result[item.key][child.key] = child.english_value;
            });
            item.messages.forEach((err) => {
              result[item.key][err.error_code] = err.english_value;
            });
          });

          return result;
        }
        let dataLabel;
        try {
          const res = await axios.post(
            `https://devcrmapi.digivarsity.com/common/get_label_list`
          );
          console.log("labels", res);
          dataLabel = transformData(res.data);
        } catch (error) {
          console.log("apihiterr", error);
        }

        console.log(dataLabel);

        // Ensure the 'messages' folder exists, create if not
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Write the fetched JSON data to the file
        await fs.writeFile(filePath, JSON.stringify(dataLabel));

        return new Response("file created", { status: 200 });
      } catch (fetchError) {
        console.error("Error fetching data:", fetchError);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
        });
      }
    } else {
      // Log any other errors
      console.error("Error accessing file:", error);
      return new Response(JSON.stringify({ error: "File access error" }), {
        status: 500,
      });
    }
  }
};

generateJson();

// !!for multiple files//

// const generateJsonFiles = async () => {
//   // Define an array of file configurations
//   const files = [
//     { filename: "en.json", apiUrl: "http://localhost:3001/api/english" },
//     { filename: "hn.json", apiUrl: "http://localhost:3001/api/hindi" },
//     { filename: "es.json", apiUrl: "http://localhost:3001/api/spanish" },
//   ];

//   // Loop through each file configuration
//   for (const { filename, apiUrl } of files) {
//     // Path to the messages folder
//     const filePath = path.join(process.cwd(), "messages", filename);

//     try {
//       // Check if the file exists
//       await fs.access(filePath);

//       // If the file exists, delete it
//       await fs.unlink(filePath);

//       console.log(`${filename} deleted, fetching new data...`);
//     } catch (error) {
//       if (error.code !== "ENOENT") {
//         // If there is an error other than file not existing, log it and continue
//         console.error(`Error accessing ${filename}:`, error);
//         continue;
//       }
//     }

//     try {
//       // Fetch the data from the respective API
//       const data = await fetch(apiUrl).then((res) => res.json());

//       // Ensure the 'messages' folder exists, create it if not
//       await fs.mkdir(path.dirname(filePath), { recursive: true });

//       // Write the fetched JSON data to the file
//       await fs.writeFile(filePath, JSON.stringify(data));

//       console.log(`${filename} created with new data.`);
//     } catch (fetchError) {
//       console.error(`Error fetching data for ${filename}:`, fetchError);
//     }
//   }

//   return new Response("All files processed", { status: 200 });
// };
