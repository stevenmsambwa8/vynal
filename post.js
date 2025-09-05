
// --- Upload Post ---
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("uTitle").value;
  const tags = document.getElementById("uTags").value.split(",");
  const desc = document.getElementById("uDesc").value;
  const cover = document.getElementById("uCover").files[0];

  const { data: fileData, error: uploadError } = await sb.storage
    .from("post-media")
    .upload(`public/${Date.now()}_${cover.name}`, cover);

  if (uploadError) return console.error(uploadError);

  const mediaUrl = sb.storage
    .from("post-media")
    .getPublicUrl(fileData.path).publicUrl;

  const { error: insertError } = await sb.from("posts").insert([{
    author: currentUser.email,
    title,
    description: desc,
    tags,
    media_url: mediaUrl
  }]);

  if (insertError) console.error(insertError);
  else document.getElementById("uploadModal").classList.add("hidden");
});

// --- Add Interaction ---
document.addEventListener("click", async (e) => {
  const postId = e.target.closest(".action-btn")?.dataset?.postId;
  if (!postId) return;

  let type = null;
  let content = null;

  if (e.target.closest(".like-btn")) type = "like";
  if (e.target.closest(".comment-btn")) {
    type = "comment";
    content = prompt("Add your comment:");
  }
  if (e.target.closest(".share-btn")) {
    type = "share";
    navigator.share({ title: "Check this out!", url: `https://yourapp.com/post/${postId}` });
  }

  if (!type) return;

  await sb.from("interactions").insert([{
    post_id: postId,
    type,
    username: currentUser.email,
    content
  }]);
});

// --- Realtime Listener ---
sb.channel("realtime-interactions")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "interactions"
  }, (payload) => {
    const interaction = payload.new;
    handleRealtimeUpdate(interaction);
  })
  .subscribe();

// --- UI Update Handler ---
function handleRealtimeUpdate(interaction) {
  if (interaction.type === "like") {
    const btn = document.querySelector(`.like-btn[data-post-id="${interaction.post_id}"] span`);
    if (btn) btn.textContent = parseInt(btn.textContent) + 1;
  }

  if (interaction.type === "comment") {
    const container = document.querySelector(`#comments-${interaction.post_id}`);
    if (container) {
      const html = `
        <div class="comment">
          <div class="comment-avatar"><img src="user.jpg" alt="@${interaction.username}"></div>
          <div class="comment-body">
            <div class="comment-header"><span class="comment-author">@${interaction.username}</span></div>
            <div class="comment-text">${interaction.content}</div>
            <div class="comment-footer"><span class="comment-time">just now</span></div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", html);
    }
  }
}
