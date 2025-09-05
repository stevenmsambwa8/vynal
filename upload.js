function safeSlug(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extOf(file) {
  const name = file.name || "";
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

function timestamp() {
  return Date.now();
}

async function uploadToBucket(bucket, path, file) {
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateUploadForm()) return;

  const userId = window.currentUser?.id;
  if (!userId) {
    alert("Not authenticated. Please log in again.");
    return;
  }

  const title = uTitle.value.trim();
  const genre = (uGenre.value || "").trim();
  const tags = (uTags.value || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
  const bpm = uBpm.value ? parseInt(uBpm.value, 10) : null;
  const description = uDesc.value.trim() || null;
  const audioFile = uFile.files?.[0];
  const coverFile = uCover.files?.[0] || null;

  // Build file paths
  const base = `${userId}/${safeSlug(title)}-${timestamp()}`;
  const audioPath = `${base}.${extOf(audioFile) || "mp3"}`;
  const coverPath = coverFile ? `${base}-cover.${extOf(coverFile) || "jpg"}` : null;

  // Lock UI
  const submitBtn = document.getElementById("uSubmit");
  submitBtn.disabled = true;
  setProgressMessage("Uploading audio...");

  try {
    // Upload audio
    const audioUrl = await uploadToBucket("audio", audioPath, audioFile);

    // Upload cover (optional)
    let coverUrl = null;
    if (coverFile) {
      setProgressMessage("Uploading cover...");
      coverUrl = await uploadToBucket("covers", coverPath, coverFile);
    }

    // Insert post into DB
    setProgressMessage("Saving post...");
    const { data, error } = await sb
      .from("posts")
      .insert([
        {
          user_id: userId,
          title,
          genre,
          tags,
          bpm,
          description,
          audio_url: audioUrl,
          cover_url: coverUrl
        }
      ])
      .select();

    if (error) throw error;

    const newPost = data?.[0];
    setProgressMessage("Done!");

    // Render immediately
    if (newPost) {
      prependRenderedPost(newPost);
    }

    // Reset form
    uploadForm.reset();
    setTimeout(() => setProgressMessage(""), 800);
    closeUploadModal();

  } catch (err) {
    console.error(err);
    alert("Upload failed: " + (err?.message || "Unknown error"));
  } finally {
    submitBtn.disabled = false;
  }
});


function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function postCardHTML(post) {
  const authorName = post.profiles?.full_name || "Unknown Artist";
  const authorAvatar = post.profiles?.avatar_url || "cod.jpg";
  const authorHandle = post.profiles?.username || (post.profiles?.full_name || "user");
  const cov = post.cover_url || "cod.jpg";
  const desc = post.description ? escapeHtml(post.description) : "";
  const tagsHtml = (post.tags || []).map(t => `<span class="hashtag">#${escapeHtml(t)}</span>`).join(" ");

  return `
  <div class="span-4" data-animate>
    <div class="post-card" data-animate>
      <div class="post-header">
        <div class="post-header-left">
          <img src="${authorAvatar}" alt="avatar" style="border-radius: 10px;border: none;box-shadow: none;">
          <div class="post-header-info">
            <strong>${escapeHtml(authorName)}</strong>
            <div class="muted">
              <a href="#statehome.html" data-link style="text-decoration: underline;">${escapeHtml(authorHandle)}</a> - 
              <span style="font-weight: 600;"> ${timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        <div class="post-header-right">
          <button class="btn" data-view-post="${post.id}">View Post</button>
        </div>
      </div>

      <div class="post-body">
        ${escapeHtml(post.title)} ${desc ? "— " + desc : ""} ${tagsHtml}
      </div>

      <div class="post-media">
        <img src="${cov}" alt="Post media" width="100%">
      </div>

      <div class="post-actions">
        <button class="action-btn like-btn"><i class="ri-heart-line"></i><span>0</span></button>
        <button class="action-btn comment-btn"><i class="ri-chat-3-line"></i><span>0</span></button>
        <button class="action-btn share-btn"><i class="ri-share-forward-line"></i><span>0</span></button>
        <button class="action-btn"><i class="ri-bookmark-line"></i><span>0</span></button>
      </div>
    </div>
  </div>
  `;
}


const postsContainer = document.getElementById("posts-container");

function renderPosts(posts) {
  postsContainer.innerHTML = posts.map(postCardHTML).join("");
}

function prependRenderedPost(post) {
  const tmp = document.createElement("div");
  tmp.innerHTML = postCardHTML(post).trim();
  const card = tmp.firstElementChild;
  postsContainer.prepend(card);
}


async function fetchLatestPosts(limit = 20) {
  const { data, error } = await sb
    .from("posts")
    .select(`
      *,
      profiles:user_id ( full_name, avatar_url, username )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching posts:", error.message);
    return [];
  }
  return data || [];
}

// On dashboard load:
fetchLatestPosts().then(renderPosts);


