import { Ref } from '@vue/runtime-dom'
import { DataT } from "../dto/globle.dto"

export interface FeedsModel {
  feed: string,
  page: number,
}

export type DTOModel = {
  comments: any,
  comments_count: number,
  id: number,
  points: number,
  time: number,
  title: string,
  type: string,
  url: string,
  user: string,
}

export type FeedsDataT = DataT & {
  data: Ref<DTOModel>
}
