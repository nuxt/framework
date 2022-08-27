import { FeedsDataT, FeedsModel } from './model/feeds.model';
import { request } from './utils/http/request';

enum Api {
    Feeds = '/api/hn/feeds',
}

export const FeedsApi = (params: FeedsModel) => request<FeedsDataT>( Api.Feeds, { method: 'GET', params: params } );
