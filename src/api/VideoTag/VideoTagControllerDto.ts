/**
 * Schema for a tag name entry
 */
export type VideoTagNameSchema = {
  /** Tag display name */
  name: string;
  /** Whether this is the default display name within its language */
  isDefault: boolean;
  /** Whether this is the original tag name */
  isOriginalTagName: boolean;
};

/**
 * Multilingual tag name schema
 */
export type MultilingualVideoTagNameSchema = {
  /** Language code, e.g., 'en', 'zh' */
  lang: string;
  /** List of tag names for this language */
  tagName: VideoTagNameSchema[];
};

/**
 * Video tag entity
 */
export type VideoTag = {
  /** Tag ID */
  tagId: number;
  /** Multilingual tag names */
  tagNameList: MultilingualVideoTagNameSchema[];
};

/**
 * Request payload to create a video tag
 */
export type CreateVideoTagRequestDto = {
  /** Multilingual tag names */
  tagNameList: MultilingualVideoTagNameSchema[];
};

/**
 * Response for creating a video tag
 */
export type CreateVideoTagResponseDto = {
  /** Execution result */
  success: boolean;
  /** Extra message */
  message?: string;
  /** Created tag */
  result?: VideoTag;
};

/**
 * Response for searching video tags
 */
export type SearchVideoTagResponseDto = {
  /** Execution result */
  success: boolean;
  /** Extra message */
  message?: string;
  /** Matched tags */
  result?: VideoTag[];
};

/**
 * Request payload to get tags by tag IDs
 */
export type GetVideoTagByTagIdRequestDto = {
  /** Tag IDs */
  tagId: number[];
};

/**
 * Response for getting tags by tag IDs
 */
export type GetVideoTagByTagIdResponseDto = SearchVideoTagResponseDto & {}; 