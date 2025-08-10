export type VideoTagNameSchema = {
  name: string;
  isDefault: boolean;
  isOriginalTagName: boolean;
};

export type MultilingualVideoTagNameSchema = {
  lang: string;
  tagName: VideoTagNameSchema[];
};

export type VideoTag = {
  tagId: number;
  tagNameList: MultilingualVideoTagNameSchema[];
};

export type CreateVideoTagRequestDto = {
  tagNameList: MultilingualVideoTagNameSchema[];
};

export type CreateVideoTagResponseDto = {
  success: boolean;
  message?: string;
  result?: VideoTag;
};

export type SearchVideoTagResponseDto = {
  success: boolean;
  message?: string;
  result?: VideoTag[];
};

export type GetVideoTagByTagIdRequestDto = {
  tagId: number[];
};

export type GetVideoTagByTagIdResponseDto = SearchVideoTagResponseDto & {}; 