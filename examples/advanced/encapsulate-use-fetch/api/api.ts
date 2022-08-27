import { Ref } from '@vue/runtime-dom'
import { DataT } from './globle.type';
import { request } from './request'

enum Api {
    Feeds = '/api/hn/feeds',
}

interface FeedsModel {
    feed: string,
    page: number,
}

type DTOModel = {
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

type FeedsDataT = DataT & {
    data: Ref<DTOModel>
}

export const FeedsApi = (params: FeedsModel) => request<FeedsDataT>( Api.Feeds, { method: 'GET', params: params } );
