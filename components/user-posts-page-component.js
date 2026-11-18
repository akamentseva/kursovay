import { USER_POSTS_PAGE, POSTS_PAGE, AUTH_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost } from "../api.js";

const escapeHtml = (str) => {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

export function renderUserPostsPageComponent({ appEl }) {
  const postsHtml = posts
    .map((post) => {
      const isLiked = post.likes.some(
        (like) => like._id === user?._id || like.id === user?.id,
      );
      return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user._id || post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image">
              <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post._id || post.id}" class="like-button">
              <img src="./assets/images/${isLiked ? "like-active" : "like-not-active"}.svg">
            </button>
            <p class="post-likes-text">Нравится: <strong>${post.likes.length}</strong></p>
          </div>
          <p class="post-text">
            <span class="user-name">${escapeHtml(post.user.name)}</span>
            ${escapeHtml(post.description)}
          </p>
        </li>
      `;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div style="padding: 20px; text-align: center;">
        <button class="button" id="back-button" style="margin-bottom: 20px;">← На главную</button>
        <h2>Посты пользователя</h2>
      </div>
      <ul class="posts">
        ${postsHtml || "<p style='text-align:center;'>У пользователя пока нет постов.</p>"}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;
  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  document
    .getElementById("back-button")
    .addEventListener("click", () => goToPage(POSTS_PAGE));

  appEl.querySelector(".posts").addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (likeButton) {
      if (!user) {
        alert("Войдите, чтобы ставить лайки!");
        goToPage(AUTH_PAGE);
        return;
      }
      likePost({
        postId: likeButton.dataset.postId,
        token: `Bearer ${user.token}`,
      })
        .then(() => goToPage(USER_POSTS_PAGE))
        .catch((error) => alert(error.message));
    }
  });
}
