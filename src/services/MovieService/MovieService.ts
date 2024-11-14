import { getNameFromShow, getSlug } from '@/lib/utils';
import type {
  CategorizedShows,
  KeyWordResponse,
  MediaType,
  Show,
  ShowWithGenreAndVideo,
} from '@/types';
import { type AxiosResponse } from 'axios';
import BaseService from '../BaseService/BaseService';
import {
  RequestType,
  type ShowRequest,
  type TmdbPagingResponse,
  type TmdbRequest,
} from '@/enums/request-type';
import { Genre } from '@/enums/genre';
import { cache } from 'react';
import axios from 'axios';

const requestTypesNeedUpdateMediaType = [
  RequestType.TOP_RATED,
  RequestType.NETFLIX,
  RequestType.POPULAR,
  RequestType.GENRE,
  RequestType.KOREAN,
];
const baseUrl = 'https://api.themoviedb.org/3';

class MovieService extends BaseService {
  static getImagePath(path: string | null, size: 'original' | 'w500' = 'w500'): string {
    if (!path) {
      return '/placeholder.svg';
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  static async findCurrentMovie(id: number, pathname: string): Promise<Show | null> {
    const data = await Promise.allSettled([
      this.findMovie(id),
      this.findTvSeries(id),
    ]);
    const response = data
      .filter(this.isFulfilled)
      .map(
        (item: PromiseFulfilledResult<AxiosResponse<Show>>) => item.value?.data,
      )
      .filter((item: Show) => {
        return pathname.includes(getSlug(item.id, getNameFromShow(item)));
      });
    if (!response?.length) {
      return null;
    }
    return response[0];
  }

  static findMovie = cache(async (id: number) => {
    return this.axios(baseUrl).get<Show>(`/movie/${id}`);
  });

  static findTvSeries = cache(async (id: number) => {
    return this.axios(baseUrl).get<Show>(`/tv/${id}`);
  });

  static async getKeywords(
    id: number,
    type: 'tv' | 'movie',
  ): Promise<AxiosResponse<KeyWordResponse>> {
    return this.axios(baseUrl).get<KeyWordResponse>(`/${type}/${id}/keywords`);
  }

  static findMovieByIdAndType = cache(async (id: number, type: string): Promise<ShowWithGenreAndVideo | null> => {
    const params: Record<string, string> = {
      language: 'en-US',
      append_to_response: 'videos',
    };
    try {
      const response: AxiosResponse<ShowWithGenreAndVideo> = await this.axios(
        baseUrl
      ).get<ShowWithGenreAndVideo>(`/${type}/${id}`, { params });
      
      console.log(response)
      if (response.data) {
        response.data.poster_path = this.getImagePath(response.data.poster_path);
        response.data.backdrop_path = this.getImagePath(response.data.backdrop_path, 'original');
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`Resource not found for type: ${type}, id: ${id}`);
        return null;
      }
      console.error(`Error fetching movie/show data:`, error);
      throw error;
    }
  });

  static urlBuilder(req: TmdbRequest) {
    switch (req.requestType) {
      case RequestType.TRENDING:
        return `/trending/${
          req.mediaType
        }/day?language=en-US&with_original_language=en&page=${req.page ?? 1}`;
      case RequestType.TOP_RATED:
        return `/${req.mediaType}/top_rated?page=${
          req.page ?? 1
        }&with_original_language=en&language=en-US`;
      case RequestType.NETFLIX:
        return `/discover/${
          req.mediaType
        }?with_networks=213&with_original_language=en&language=en-US&page=${
          req.page ?? 1
        }`;
      case RequestType.POPULAR:
        return `/${
          req.mediaType
        }/popular?language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.GENRE:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.KOREAN:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&with_original_language=ko&language=en-US&page=${req.page ?? 1}`;
      default:
        throw new Error(
          `request type ${req.requestType} is not implemented yet`,
        );
    }
  }

  static executeRequest(req: {
    requestType: RequestType;
    mediaType: MediaType;
    page?: number;
  }) {
    return this.axios(baseUrl).get<TmdbPagingResponse>(this.urlBuilder(req));
  }

  static getShows = cache(async (requests: ShowRequest[]): Promise<CategorizedShows[]> => {
    const shows: CategorizedShows[] = [];
    const promises = requests.map((m) => this.executeRequest(m.req));
    const responses = await Promise.allSettled(promises);
    for (let i = 0; i < requests.length; i++) {
      const res = responses[i];
      if (this.isRejected(res)) {
        console.warn(`Failed to fetch shows ${requests[i].title}`, res.reason);
        shows.push({
          title: requests[i].title,
          shows: [],
          visible: requests[i].visible,
        });
      } else if (this.isFulfilled(res)) {
        if (
          requestTypesNeedUpdateMediaType.indexOf(requests[i].req.requestType) >
          -1
        ) {
          res.value.data.results.forEach(f => {
            f.media_type = requests[i].req.mediaType;
            f.poster_path = this.getImagePath(f.poster_path);
            f.backdrop_path = this.getImagePath(f.backdrop_path, 'original');
          });
        }
        shows.push({
          title: requests[i].title,
          shows: res.value.data.results,
          visible: requests[i].visible,
        });
      } else {
        throw new Error('unexpected response');
      }
    }
    return shows;
  });

  static searchMovies = cache(async (query: string, page?: number): Promise<TmdbPagingResponse> => {
    const { data } = await this.axios(baseUrl).get<TmdbPagingResponse>(
      `/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=${
        page ?? 1
      }`,
    );
  
    // Filter out items where either backdrop_path or poster_path is null or undefined
    data.results = data.results
      .filter(item => item.backdrop_path !== null && item.backdrop_path !== undefined &&
                      item.poster_path !== null && item.poster_path !== undefined)
      .sort((a, b) => b.popularity - a.popularity);
  
    return data;
  });
  
}

export default MovieService;