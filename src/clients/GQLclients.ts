import { request } from "graphql-request";

export default class GQLClient {
  queryUrl: string = "";
  name: string = "";

  constructor(queryUrl: string, name: string) {
    this.queryUrl = queryUrl;
    this.name = name;
  }

  public async query(gqlQuery) {
    return request(this.queryUrl, gqlQuery);
  }
}
