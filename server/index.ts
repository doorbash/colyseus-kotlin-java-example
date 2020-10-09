import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema"


const port = Number(process.env.PORT || 2567);
const app = express()

app.use(cors());
app.use(express.json())

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

class PrimitivesTest extends Schema {
  @type("uint8")
  _uint8: number = 255;

  @type("uint16")
  _uint16: number = 65535;

  @type("uint32")
  _uint32: number = 4294967295;

  @type("uint64")
  _uint64: number = 18446744073709551615;

  @type("int8")
  _int8: number = -128;

  @type("int16")
  _int16: number = -32768;

  @type("int32")
  _int32: number = -2147483648;

  @type("int64")
  _int64: number = -9223372036854775808;

  @type("float32")
  _float32_n: number = -3.4e+38;

  @type("float32")
  _float32_p: number = +3.4E+38;

  @type("float64")
  _float_64_n: number = -1.7E+308;

  @type("float64")
  _float_64_p: number = +1.7E+308;

  @type("boolean")
  _boolean: boolean = true;

  @type("string")
  _string: string = "hello world!";
}

class Player extends Schema {
  @type("int32")
  x: number = 10;
}

class Cell extends Schema {
  @type("float32")
  x: number;

  @type("float32")
  y: number;
}

class MyState extends Schema {
  @type(PrimitivesTest)
  primitives: PrimitivesTest = new PrimitivesTest();

  @type([Player])
  players = new ArraySchema<Player>();

  @type({ map: Cell })
  cells = new MapSchema<Cell>();
}

class GameRoom extends Room<MyState> {
  onCreate() {
    var state = new MyState()
    for (var i = 0; i < 100; i++) {
      var player = new Player()
      player.x = i * 10
      state.players.push(player)
    }
    this.setState(state)
    var x = 0
    setInterval(() => {
      // state.players[0].x++
      //this.broadcast("xxxxx", state.players[0])
      // this.broadcast(0, state)
      // state.primitives._float_64_n += 1.234234
      // console.log("float = " + state.primitives._float_64_n)
      // this.broadcast("hello", state.players)
      // this.broadcast(4.3)
      x++
      var cell = new Cell()
      cell.x = x
      state.cells.set("hello_" + x , cell)

      if(state.players.length > 6) {
        state.players.pop()
        state.players.splice(6, 1);
      }

      state.primitives._boolean = !state.primitives._boolean

      // this.broadcast(state.primitives)

      this.broadcast("hi", state.cells)

      this.broadcast("hey", state.players)

      var cell0 = state.cells.get("hello_1")
      cell0.x++

      this.broadcast("sup", cell0)

      var cell = new Cell()
      cell.x = 10000
      cell.y = 20000

      this.broadcast(cell)

      this.broadcast("hello", Math.random() * 100)

    }, 3000)


    this.onMessage("fire", (client, message) => {
      console.log("message(fire): from", client.id, ":", message)
    });

    this.onMessage(2, (client, message) => {
      console.log("message(2): from", client.id, ":", message)
    })
  }
  onJoin(client: Client, options: any) {
  }

  onLeave(client: Client, consented: boolean) {
  }
}



// register your room handlers
gameServer.define('game', GameRoom);

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`)

