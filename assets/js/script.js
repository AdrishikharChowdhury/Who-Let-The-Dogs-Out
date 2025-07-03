let generate=document.querySelector("#generate");
const BASE_URL=`https://dog.ceo/api/breed`;
let dogbreeds=document.querySelector(".bl");
let subdogbreeds=document.querySelector(".sbl");
let breedlist=document.querySelector("#breed-list");
let subbreedlist=document.querySelector("#sub-breed-list")
let pictureFrame=document.querySelector("#dog-photo");
let facts=document.querySelector(".facts");
let download=document.querySelector("#download");
let breedsData = {};
let subbreeds= {};
let copy=document.querySelector("#copy")
const FACT_URL=`https://dogapi.dog/api/v2/facts?limit=1`;
let url="";

breedlistfunc();

async function breedlistfunc() {
    try {
        let breedUrl = `${BASE_URL}s/list/all`;
        let response = await fetch(breedUrl);
        let breeds = await response.json();
        breedsData = breeds.message;
        let breedList = Object.keys(breeds.message);
        for (let breed of breedList) {
            let newOption = document.createElement("option");
            newOption.innerText = breed[0].toUpperCase() + breed.slice(1);
            newOption.value = breed;
            dogbreeds.appendChild(newOption);
        }
    } catch (error) {
        console.log(error);
    }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

dogbreeds.addEventListener("change", function() {
    let breed = dogbreeds.value;
    subbreeds = breedsData[breed];
    subdogbreeds.innerHTML = "";
    if (subbreeds.length > 0) {
        subdogbreeds.style.display = "inline";
        for (let sub of subbreeds) {
            let subOption = document.createElement("option");
            subOption.innerText = sub[0].toUpperCase() + sub.slice(1);
            subOption.value = sub;
            subdogbreeds.appendChild(subOption);
        }
    } else {
        subdogbreeds.style.display = "none";
    }
});

copy.addEventListener("click",async (e)=>{
    try {
        let textCopy=facts.innerText;
        await navigator.clipboard.writeText(textCopy);
        copy.innerText="Copied";
        setTimeout(()=>{
            copy.innerHTML=`<i class="fa-solid fa-clipboard"></i>`;
        },1500)
    } catch (error) {
        
    }
})

generate.addEventListener("click", async (e) => {
    try {
        let dogUrl = "";
        if (breedlist.value === "None" || !breedlist.value) {
            dogUrl = `${BASE_URL}s/image/random`;
        } else if (subbreedlist && subbreedlist.style.display !== "none" && subbreedlist.value) {
            dogUrl = `${BASE_URL}/${breedlist.value}/${subbreedlist.value}/images/random`;
        } else {
            dogUrl = `${BASE_URL}/${breedlist.value}/images/random`;
        }
        let response1 = await fetch(dogUrl);
        let data1 = await response1.json();
        pictureFrame.style.backgroundImage = `url(${data1.message})`;
        let response2 = await fetch(FACT_URL);
        let data2 = await response2.json();
        facts.style.display="flex";
        facts.innerText = `Here's a fun fact for you: ${data2.data[0].attributes.body}`;
        copy.style.display="inline";
    } catch (error) {
        console.log(error);
    }
});

download.addEventListener("click", async (e) => {
    try {
        e.preventDefault();
        let bgUrl = pictureFrame.style.backgroundImage;
        let imageUrl = bgUrl.slice(4, -1).replace(/["']/g, "");
        let response = await fetch(imageUrl, {mode: "cors"});
        let blob = await response.blob();
        let img = new Image();
        img.onload = function() {
            let canvas = document.getElementById("dog-canvas");
            let captionHeight = 80;
            canvas.width = img.width;
            canvas.height = img.height + captionHeight;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(0, img.height, img.width, captionHeight);
            ctx.font = "20px sans-serif";
            ctx.fillStyle = "black";
            ctx.textBaseline = "top";
            let factText = facts.innerText || facts.textContent || "Dog Fact!";
            wrapText(ctx, factText, 10, img.height + 10, img.width - 20, 24);
            canvas.toBlob(function(blob) {
                let url = URL.createObjectURL(blob);
                let link = document.createElement("a");
                if(breedlist.value=="None")
                {
                    link.download = `Random_Dog_Image_with_Fact.jpg`;
                }
                else{
                    link.download = `${breedlist.value}_Dog_Image_with_Fact.jpg`;
                }
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, "image/jpeg");
        };

        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(blob);

    } catch (error) {
        console.log(error);
    }
});

let shareBtn = document.getElementById("share");

shareBtn.addEventListener("click", async (e) => {
    try {
        // Get the image URL from the backgroundImage style
        let bgUrl = pictureFrame.style.backgroundImage;
        let imageUrl = bgUrl.slice(4, -1).replace(/["']/g, "");
        let response = await fetch(imageUrl, {mode: "cors"});
        let blob = await response.blob();
        let img = new Image();

        img.onload = async function() {
            let canvas = document.getElementById("dog-canvas");
            let captionHeight = 80;
            canvas.width = img.width;
            canvas.height = img.height + captionHeight;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(0, img.height, img.width, captionHeight);
            ctx.font = "20px sans-serif";
            ctx.fillStyle = "black";
            ctx.textBaseline = "top";
            let factText = facts.innerText || facts.textContent || "Dog Fact!";
            wrapText(ctx, factText, 10, img.height + 10, img.width - 20, 24);

            canvas.toBlob(async function(blob) {
                let file = new File([blob], "Dog_Image_with_Fact.jpg", { type: "image/jpeg" });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: "Check out this dog!",
                            text: factText,
                            files: [file]
                        });
                    } catch (err) {
                        alert("Sharing canceled or failed.");
                    }
                } else {
                    alert("Sharing not supported on this device. Try downloading instead!");
                }
            }, "image/jpeg");
        };

        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(blob);

    } catch (error) {
        console.log(error);
        alert("Could not share the image. Try downloading instead!");
    }
});




