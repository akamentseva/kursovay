import { USER_POSTS_PAGE, POSTS_PAGE, AUTH_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { likePost, dislikePost } from "../api.js";

const escapeHtml = (str) => {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
};

export function renderPostsPageComponent({ appEl }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const postsHtml = posts
    .map((post) => {
      const isLiked = post.likes.some(
        (like) => like._id === user?._id || like.id === user?.id,
      );
      const likesCount = post.likes.length;

      return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user._id || post.user.id}">
              <img src="${post.user.imageUrl}" class="post-header__user-image">
              <!-- Применяем escapeHtml к имени -->
              <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post._id || post.id}" class="like-button">
              <img src="./assets/images/${isLiked ? "like-active" : "like-not-active"}.svg">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${likesCount}</strong>
            </p>
          </div>
          <p class="post-text">
            <!-- Применяем escapeHtml к имени и описанию -->
            <span class="user-name">${escapeHtml(post.user.name)}</span>
            ${escapeHtml(post.description)}
          </p>
          <p class="post-date">
            ${formatDate(post.createdAt)}
          </p>
        </li>
      `;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  const postsList = appEl.querySelector(".posts");

  postsList.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (likeButton) {
      if (!user) {
        alert("Войдите, чтобы ставить лайки!");
        goToPage(AUTH_PAGE);
        return;
      }

      const postId = likeButton.dataset.postId;
      const token = `Bearer ${user.token}`;

      const post = posts.find((p) => (p._id || p.id) === postId);
      const isAlreadyLiked =
        post &&
        post.likes.some((like) => like._id === user._id || like.id === user.id);

      const request = isAlreadyLiked
        ? dislikePost({ postId, token })
        : likePost({ postId, token });

      request
        .then(() => {
          goToPage(POSTS_PAGE);
        })
        .catch((error) => {
          alert("Ошибка: " + error.message);
        });

      return;
    }

    const postHeader = event.target.closest(".post-header");
    if (postHeader) {
      goToPage(USER_POSTS_PAGE, {
        userId: postHeader.dataset.userId,
      });
      return;
    }
  });
}
