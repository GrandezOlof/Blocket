import * as React from 'react';
import styles from './Blocket.module.scss';
import { IBlocketProps } from './IBlocketProps';
import { escape } from '@microsoft/sp-lodash-subset';

import { sp, SearchQuery, SearchResults, Web, List, PrincipalSource, ItemAddResult, ItemUpdateResult, Item, Items } from"@pnp/sp";
import { object } from 'prop-types';

import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { CurrentUser } from '@pnp/sp/src/siteusers';
import { loadTheme } from '@uifabric/styling';

import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { PrimaryButton, Panel, TextField  } from 'office-ui-fabric-react';

import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';



export interface IBlocketState {
  items: any;
  currentUser: any;
  choises: any;
  searchItems: any;
  search: boolean;
  sort: boolean;

  updateId:number;
  order: boolean;
  showPanel: boolean;
  showPanelAdd: boolean;
  Rubrik: string;
  Text: string;
  Price: string;
  Person: string;
  Date: string;
  newForm: boolean;
  Id: any;
}

export default class Blocket extends React.Component<IBlocketProps, IBlocketState> {
  

  constructor(props:IBlocketProps, state: IBlocketState)
  {
    super(props);
    
    this.state = {
      items: [],
      currentUser: {},
      choises: [],
      searchItems:[],
      search: false,
      sort: false,
      order: true,
      showPanel: false,
      showPanelAdd: false,
      Rubrik: '',
      Text: '',
      Price: '',
      Person: '',
      Date:'',
      newForm: false,
      Id: '',
      updateId:undefined
    };
  }

  componentDidMount()
  { 
    sp.web.lists.getByTitle("Auction").fields
    .getByInternalNameOrTitle('Category')
    .select('Choices')
    .get()
    .then((result: any[]) =>{
      this.setState({
        choises: result["Choices"]
      })
    });

    this.getItems();
  }

  
  public getItems = (): void =>{
    sp.web.lists.getByTitle("Auction").items.getAll()
    .then((result: any) => {
      this.setState({
        items: result
      });
    });

    sp.web.currentUser.get()
    .then((result: any)=>{
      this.setState({
        currentUser: result
      });
    });
  }

  private addAuctions = (e: any):void =>{
    e.preventDefault();
    console.log(e);
    console.log(Items);

    sp.web.lists.getByTitle("Auction").items.add({
      Title: e.target.Title.value,
      Text: e.target.Text.value,
      Price: e.target.Pris.value,
      Date: e.target.Datum.value,
      User: e.target.Person.value,
      Category: e.target.Kategori.value
    }).then((result: ItemAddResult) =>{
      this.setState({
        items: [...this.state.items, result["data"]]
      })
    });
    
    this.getItems();
    this._hidePanel();
  }
  
  private updateAuction = async (e: any) =>{
    e.preventDefault();
    console.log(e.target.Title.value);
    await sp.web.lists.getByTitle("Auction").items.getById(this.state.Id).update({
      Title: e.target.Title.value,
      Text: e.target.Text.value,
      Price: e.target.Pris.value,
      Category: e.target.Kategori.value
    }).then(() => {
      this.getItems();
      this._hidePanel();
    });
  }

  private removeAuction = (id): void => {
    sp.web.lists.getByTitle("Auction").items.getById(id)
    .delete()
    .then(() => {
      this.getItems();
      this._hidePanel();
    })
    console.log(id)
  }

  private searchAuction = (e) : void => {
    e.preventDefault()

    let foundItems = this.state.items.filter( item => {
      return (
        item.Title.toLowerCase().includes(e.target.search.value.toLowerCase()) || 
        item.Category.toLowerCase().includes(e.target.search.value.toLowerCase())
      );
    });
    foundItems !== [] ? this.setState({searchItems: foundItems, search: true}) : null
  }

  private sortMethod = () : void => {
    if(this.state.sort == true){
      console.log(this.state.searchItems);
      this.setState({
        searchItems: this.state.searchItems.sort((a,b) => {
          return(a.Price - b.Price)
        }),
        sort: false
      });
    }else{
      console.log(this.state.searchItems);
      this.setState({
        searchItems: this.state.searchItems.sort((a,b) =>{
          return (b.Price - a.Price)
        }),
        sort: true
      });
    }
  }

  private _showPanel = (item: any): void => {
    console.log(item.id)
    this.setState({
      showPanel: true,
      Rubrik: item.Title,
      Text: item.Text,
      Price: item.Price,
      Person: item.User,
      Date: item.Date,
      Id: item.Id
    });
  }

  private _showPanelAdd = (item: any): void => {
    this.setState({
      showPanelAdd: true
    });
  }

  private _hidePanel = (): void => {
    this.setState({
      showPanel: false,
      showPanelAdd: false
    });
  }

  private refreshPage() {
    window.location.reload(false);
  }

  public render(): React.ReactElement<IBlocketProps> {

    let showAuctions: JSX.Element = undefined;

    if(this.state.search === true){
      showAuctions = this.state.searchItems.map(item => {
        return(
            <tr onClick={() =>{this._showPanel(item)}}>
              <td>{item.Title}</td>
              <td>{item.Text}</td>
              <td>{item.Price}</td>
              <td>{item.Date.substr(0,10)}</td>
              <td>{item.User}</td>
              <td>{item.Category}</td>
              <PrimaryButton className={styles.button} text="Show More" onClick={() =>{this._showPanel(item)}} />
            </tr>
            );
      });
    }
    else{
      showAuctions = this.state.items.map(item => {
        return(
            <tr onClick={() =>{this._showPanel(item)}}>
              <td>{item.Title}</td>
              <td>{item.Text}</td>
              <td>{item.Price}</td>
              <td>{item.Date.substr(0,10)}</td>
              <td>{item.User}</td>
              <td>{item.Category}</td>
              <PrimaryButton className={styles.button} text="Show More" onClick={() =>{this._showPanel(item)}} />
            </tr>
            );
      });
    }
    let showChoices: JSX.Element[] = this.state.choises.map(item => {
      return (
          <option value={item}>{item}</option>
      )
    });

    let formButton: JSX.Element = !this.state.newForm ? (
      <div>
        <PrimaryButton className={styles.button} text="Delete" type="submit" onClick={() => {this.removeAuction(this.state.Id)}} />
        <PrimaryButton className={styles.button} text="Update" type="submit"/>
      </div>
    ):null

    let showFormbutton = this.state.currentUser["Title"] == this.state.Person || this.state.newForm ? formButton: null;

    return (
      <div className={ styles.blocket }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <Panel
              isOpen={this.state.showPanel}
              closeButtonAriaLabel="Close"
              isLightDismiss={true}
              headerText="More Info"
              onDismiss={this._hidePanel}
              >
                <form onSubmit={this.updateAuction}>
                  <label>Title</label><br/>
                  <input id="Title" type="text" name="Title" defaultValue={this.state.Rubrik}/><br/>
                  <label>Description</label><br/>
                  <input id="Text" name="Text"  defaultValue={this.state.Text}></input><br/>
                  <label>Price</label><br/>
                  <input id="Pris" type="text" name="Pris" defaultValue={this.state.Price}/><br/>
                  <label>Date</label><br/>
                  <input type="text" name="Datum" readOnly defaultValue={this.state.Date.substr(0,10)}/><br/>
                  <label>Person</label><br/>
                  <input type="text" name="Person" readOnly defaultValue={this.state.Person}/><br/>
                  <label>Category:</label><br/>
                  <select name="Kategori" >
                    {showChoices}
                  </select>
                  <br/>
                  <br/>
                  <br/>
                  {showFormbutton}
                </form>
            </Panel>
            {/* ------------------------- Add Panel ---------------- */}
            <Panel
              isOpen={this.state.showPanelAdd}
              closeButtonAriaLabel="Close"
              isLightDismiss={true}
              headerText="New Ad"
              onDismiss={this._hidePanel}
              >
                <form onSubmit={this.addAuctions}>
                  <label>Title</label><br/>
                  <input id="Title" type="text" name="Title"/><br/>
                  <label>Description</label><br/>
                  <input id="Text" type="text "name="Text"/><br/>
                  <label>Price</label><br/>
                  <input id="Pris" type="text" name="Pris"/><br/>
                  <label>Date</label><br/>
                  <input type="text" name="Datum" readOnly value={Date().toString().substr(0, 15)}/><br/>
                  <label>Person</label><br/>
                  <input type="text" name="Person" readOnly value={this.state.currentUser["Title"]}/><br/>
                  <label>Category:</label><br/>
                  <select name="Kategori" >
                    {showChoices}
                  </select>
                  <br/>
                  <br/>
                  <br/>
                  <PrimaryButton className={styles.button} text="Spara" type="submit"/>                  
                </form>
            </Panel>
            {/* ------------------------- End ADD Panel ---------------- */}
              <h1>Blocket</h1>
              <h4>Sell Everything You Want</h4>
              <br/>
              <PrimaryButton className={styles.button} text="New Ad " onClick={this._showPanelAdd} />
              <br/>
              <br/>
              <form onSubmit={this.searchAuction}>
                <input type="text" name="search"/>
                <PrimaryButton className={styles.button} text="Search" type="submit"/>                                
              </form>
              <br/>
              <br/>
              <PrimaryButton className={styles.button} text="Sort By Price" onClick={this.sortMethod} />
              <PrimaryButton className={styles.button} text="Get All" onClick={this.refreshPage} />
              <table>
                <thead>
                  <tr>
                  <th>Title</th>
                  <th>Text</th>
                  <th>Price</th>
                  <th>Date Upload</th>
                  <th>User</th>
                  <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                {showAuctions} 
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
