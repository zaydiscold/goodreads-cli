#!/usr/bin/env bash
set -euo pipefail

# Goodreads web route recipes.
#
# Usage:
#   GOODREADS_COOKIE_FILE=/path/to/cookies.txt ./goodreads-web.sh shelves-read
#
# The cookie file should be a curl-compatible cookie jar or a header fragment
# handled by your own wrapper. Do not commit cookie values.

BASE_URL="${GOODREADS_BASE_URL:-https://www.goodreads.com}"
COOKIE_FILE="${GOODREADS_COOKIE_FILE:-}"
USER_ID="${GOODREADS_USER_ID:-179929687}"
USER_SLUG="${GOODREADS_USER_SLUG:-179929687-zayd-khan}"

curl_args=(
  --silent
  --show-error
  --location
  --compressed
  --user-agent "Mozilla/5.0 GoodreadsResearch/0.1"
)

if [[ -n "$COOKIE_FILE" ]]; then
  curl_args+=(--cookie "$COOKIE_FILE" --cookie-jar "$COOKIE_FILE")
fi

route="${1:-help}"

case "$route" in
  opensearch)
    curl "${curl_args[@]}" "$BASE_URL/opensearch.xml"
    ;;
  search-books)
    query="${2:?search query required}"
    curl "${curl_args[@]}" --get \
      --data-urlencode "search_type=books" \
      --data-urlencode "search[query]=$query" \
      "$BASE_URL/search/search"
    ;;
  explore-books)
    curl "${curl_args[@]}" "$BASE_URL/book?ref=nav_brws_explore"
    ;;
  new-releases)
    year="${2:-2026}"
    month="${3:-5}"
    curl "${curl_args[@]}" "$BASE_URL/book/popular_by_date/$year/$month?ref=nav_brws_newrels"
    ;;
  similar-books)
    work_slug="${2:?work slug required}"
    curl "${curl_args[@]}" "$BASE_URL/book/similar/$work_slug"
    ;;
  work-editions)
    work_id="${2:?work id required}"
    curl "${curl_args[@]}" "$BASE_URL/work/editions/$work_id"
    ;;
  work-quotes)
    work_id="${2:?work id required}"
    curl "${curl_args[@]}" "$BASE_URL/work/quotes/$work_id"
    ;;
  profile)
    curl "${curl_args[@]}" "$BASE_URL/user/show/$USER_SLUG"
    ;;
  profile-delayable)
    curl "${curl_args[@]}" "$BASE_URL/user/delayable_user_show/$USER_ID"
    ;;
  shelves-all)
    curl "${curl_args[@]}" "$BASE_URL/review/list/$USER_ID"
    ;;
  my-books)
    curl "${curl_args[@]}" "$BASE_URL/review/list?ref=nav_mybooks"
    ;;
  shelves-read)
    curl "${curl_args[@]}" "$BASE_URL/review/list/$USER_SLUG?shelf=read"
    ;;
  shelves-currently-reading)
    curl "${curl_args[@]}" "$BASE_URL/review/list/$USER_SLUG?shelf=currently-reading"
    ;;
  shelves-to-read)
    curl "${curl_args[@]}" "$BASE_URL/review/list/$USER_SLUG?shelf=to-read"
    ;;
  shelf-rss)
    shelf="${2:-read}"
    curl "${curl_args[@]}" "$BASE_URL/review/list_rss/$USER_ID?shelf=$shelf"
    ;;
  notes-index)
    curl "${curl_args[@]}" "$BASE_URL/notes/$USER_SLUG?ref=us_w"
    ;;
  notes-load-more)
    curl "${curl_args[@]}" "$BASE_URL/notes/$USER_ID/load_more"
    ;;
  quotes)
    curl "${curl_args[@]}" "$BASE_URL/quotes/list"
    ;;
  quotes-index)
    curl "${curl_args[@]}" "$BASE_URL/quotes?ref=nav_comm_quotes"
    ;;
  quote-show)
    quote_slug="${2:?quote slug required}"
    curl "${curl_args[@]}" "$BASE_URL/quotes/$quote_slug"
    ;;
  comments)
    curl "${curl_args[@]}" "$BASE_URL/comment/list/$USER_SLUG?ref=nav_profile_comment"
    ;;
  notifications)
    curl "${curl_args[@]}" "$BASE_URL/notifications?ref=nav_my_notifs"
    ;;
  friend-requests)
    curl "${curl_args[@]}" "$BASE_URL/friend/requests?ref=nav_my_friends"
    ;;
  friends)
    curl "${curl_args[@]}" "$BASE_URL/friend"
    ;;
  inbox)
    curl "${curl_args[@]}" "$BASE_URL/message/inbox?ref=nav_my_messages"
    ;;
  message-folder)
    folder="${2:-inbox}"
    case "$folder" in
      inbox|saved|sent|trash) ;;
      *) printf 'folder must be one of: inbox saved sent trash\n' >&2; exit 2 ;;
    esac
    curl "${curl_args[@]}" "$BASE_URL/message/$folder"
    ;;
  message-show)
    message_id="${2:?message id required}"
    curl "${curl_args[@]}" "$BASE_URL/message/show/$message_id"
    ;;
  year-in-books)
    year="${2:-2025}"
    curl "${curl_args[@]}" "$BASE_URL/user/year_in_books/$year/$USER_ID"
    ;;
  lists-index)
    curl "${curl_args[@]}" "$BASE_URL/list?ref=nav_brws_lists"
    ;;
  list-show)
    list_id="${2:-1}"
    curl "${curl_args[@]}" "$BASE_URL/list/show/$list_id"
    ;;
  awards)
    curl "${curl_args[@]}" "$BASE_URL/award"
    ;;
  award-show)
    award_slug="${2:-13-booker-prize}"
    curl "${curl_args[@]}" "$BASE_URL/award/show/$award_slug"
    ;;
  choice-awards)
    curl "${curl_args[@]}" "$BASE_URL/choiceawards?ref=nav_brws_gca"
    ;;
  authors)
    curl "${curl_args[@]}" "$BASE_URL/author"
    ;;
  author-show)
    author_slug="${2:-4.Douglas_Adams}"
    curl "${curl_args[@]}" "$BASE_URL/author/show/$author_slug"
    ;;
  giveaways)
    curl "${curl_args[@]}" "$BASE_URL/giveaway?ref=nav_brws_giveaways"
    ;;
  groups)
    curl "${curl_args[@]}" "$BASE_URL/group?ref=nav_comm_groups"
    ;;
  group-show)
    group_slug="${2:-29-mystery-lovers}"
    curl "${curl_args[@]}" "$BASE_URL/group/show/$group_slug"
    ;;
  news)
    curl "${curl_args[@]}" "$BASE_URL/news?ref=nav_brws_news"
    ;;
  interviews)
    curl "${curl_args[@]}" "$BASE_URL/interviews"
    ;;
  interview-show)
    interview_slug="${2:-12.Neil_Gaiman}"
    curl "${curl_args[@]}" "$BASE_URL/interviews/show/$interview_slug"
    ;;
  ask-the-author)
    curl "${curl_args[@]}" "$BASE_URL/ask_the_author?ref=nav_comm_askauthor"
    ;;
  question-show)
    question_slug="${2:?question slug required}"
    curl "${curl_args[@]}" "$BASE_URL/questions/$question_slug"
    ;;
  amazon-purchases)
    curl "${curl_args[@]}" "$BASE_URL/amazon_purchases?source=bb"
    ;;
  shelf-index)
    curl "${curl_args[@]}" "$BASE_URL/shelf"
    ;;
  shelf-show)
    shelf="${2:-to-read}"
    curl "${curl_args[@]}" "$BASE_URL/shelf/show/$shelf"
    ;;
  genres)
    curl "${curl_args[@]}" "$BASE_URL/genres?ref=nav_brws_genres"
    ;;
  genres-list)
    curl "${curl_args[@]}" "$BASE_URL/genres/list"
    ;;
  genre-search)
    query="${2:?genre query required}"
    curl "${curl_args[@]}" --get \
      --data-urlencode "shelf=$query" \
      "$BASE_URL/genres/search"
    ;;
  genre)
    genre="${2:-fiction}"
    curl "${curl_args[@]}" "$BASE_URL/genres/$genre"
    ;;
  people-top-readers)
    curl "${curl_args[@]}" "$BASE_URL/user/top_readers"
    ;;
  people-top-reviewers)
    curl "${curl_args[@]}" "$BASE_URL/user/top_reviewers"
    ;;
  people-popular-reviewers)
    curl "${curl_args[@]}" "$BASE_URL/user/best_reviewers?ref=nav_comm_people"
    ;;
  people-most-followed)
    curl "${curl_args[@]}" "$BASE_URL/user_following/most_followed"
    ;;
  recommendations)
    curl "${curl_args[@]}" "$BASE_URL/recommendations?ref=nav_brws_recs"
    ;;
  friends-recommendations)
    curl "${curl_args[@]}" "$BASE_URL/recommendations/to_me?ref=nav_profile_friendrec"
    ;;
  publicize-notes-dry-run)
    book_id="${2:?book id required}"
    printf 'DRY RUN: would PUT %s/notes/%s/share\n' "$BASE_URL" "$book_id"
    ;;
  shelf-move-dry-run)
    review_id="${2:?review id required}"
    shelf="${3:?target shelf required}"
    printf 'DRY RUN: would POST %s/review/update_list/%s\n' "$BASE_URL" "$USER_ID"
    printf '  form: authenticity_token=<from-current-page> view=table edit[shelf]=%s reviews[%s]=%s\n' "$shelf" "$review_id" "$review_id"
    printf '  verify: reload %s/review/list/%s?shelf=%s and confirm review/book appears there\n' "$BASE_URL" "$USER_ID" "$shelf"
    ;;
  single-shelf-add-dry-run)
    book_id="${2:?book id required}"
    shelf="${3:?target shelf required}"
    printf 'DRY RUN: would POST %s/shelf/add_to_shelf\n' "$BASE_URL"
    printf '  form: authenticity_token=<from-current-page> book_id=%s name=%s a=\n' "$book_id" "$shelf"
    ;;
  single-shelf-remove-dry-run)
    book_id="${2:?book id required}"
    shelf="${3:?target shelf required}"
    printf 'DRY RUN: would POST %s/shelf/add_to_shelf\n' "$BASE_URL"
    printf '  form: authenticity_token=<from-current-page> book_id=%s name=%s a=remove\n' "$book_id" "$shelf"
    printf '  alternate route observed in JS: %s/shelf/remove_book\n' "$BASE_URL"
    ;;
  message-action-dry-run)
    message_id="${2:?message id required}"
    action="${3:?action required: saved|trash|read}"
    case "$action" in
      saved|trash|read) ;;
      *) printf 'action must be one of: saved trash read\n' >&2; exit 2 ;;
    esac
    printf 'DRY RUN: would POST %s/message/move_batch?page=1\n' "$BASE_URL"
    printf '  form: authenticity_token=<from-current-page> folder=inbox move[folder]=%s messages[%s]=%s\n' "$action" "$message_id" "$message_id"
    ;;
  *)
    cat <<'USAGE'
Routes:
  opensearch
  search-books <query>
  explore-books
  new-releases [year] [month]
  similar-books <work-slug>
  work-editions <work-id>
  work-quotes <work-id>
  profile
  profile-delayable
  my-books
  shelves-all
  shelves-read
  shelves-currently-reading
  shelves-to-read
  shelf-rss [shelf]
  notes-index
  notes-load-more
  quotes
  quotes-index
  quote-show <quote-slug>
  comments
  notifications
  friend-requests
  friends
  inbox
  message-folder [inbox|saved|sent|trash]
  message-show <message-id>
  year-in-books [year]
  lists-index
  list-show [list-id]
  awards
  award-show [award-slug]
  choice-awards
  authors
  author-show [author-slug]
  giveaways
  groups
  group-show [group-slug]
  news
  interviews
  interview-show [interview-slug]
  ask-the-author
  question-show <question-slug>
  amazon-purchases
  shelf-index
  shelf-show [shelf-slug]
  genres
  genres-list
  genre-search <query>
  genre [slug]
  people-top-readers
  people-top-reviewers
  people-popular-reviewers
  people-most-followed
  recommendations
  friends-recommendations
  publicize-notes-dry-run <book-id>
  shelf-move-dry-run <review-id> <shelf>
  single-shelf-add-dry-run <book-id> <shelf>
  single-shelf-remove-dry-run <book-id> <shelf>
  message-action-dry-run <message-id> <saved|trash|read>
USAGE
    ;;
esac
