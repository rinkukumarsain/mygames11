 public function getutubetprofit(Request $request){
        Helpers::setHeader(200);
        Helpers::timezone();
        $geturl = Helpers::geturl();      
        $user = Helpers::isAuthorize($request);
        $uid = $user->id;
        $json = array();
        $query = DB::connection('mysql2')
		->table('registerusers')->where('registerusers.refer_id',$uid);
          
		//    $data1 = $query->join('leaugestransactions','leaugestransactions.user_id','registerusers.id')->join('finalresults','finalresults.challengeid','leaugestransactions.challengeid')->join('matchchallenges','matchchallenges.id','leaugestransactions.challengeid')->where('matchchallenges.entryfee','!=','0')->where('matchchallenges.status','!=','canceled')->join('listmatches','listmatches.matchkey','leaugestransactions.matchkey')->select('registerusers.id','leaugestransactions.bonus as ba','leaugestransactions.winning','leaugestransactions.balance','leaugestransactions.matchkey','leaugestransactions.id as league_id','finalresults.amount','matchchallenges.joinedusers','leaugestransactions.challengeid','listmatches.name','matchchallenges.entryfee','matchchallenges.win_amount','matchchallenges.status','matchchallenges.maximum_user','matchchallenges.bonus_percentage','listmatches.start_date','registerusers.team');

		$data1 = $query->join('leaugestransactions','leaugestransactions.user_id','registerusers.id')->join('matchchallenges','matchchallenges.id','leaugestransactions.challengeid')->where('matchchallenges.entryfee','!=','0')->where('matchchallenges.status','!=','canceled')->join('listmatches','listmatches.matchkey','leaugestransactions.matchkey')->select('registerusers.id','leaugestransactions.bonus as ba','leaugestransactions.winning','leaugestransactions.balance','leaugestransactions.matchkey','leaugestransactions.id as league_id','matchchallenges.joinedusers','leaugestransactions.challengeid','listmatches.name','matchchallenges.entryfee','matchchallenges.win_amount','matchchallenges.status','matchchallenges.maximum_user','matchchallenges.bonus_percentage','listmatches.start_date','registerusers.team');
		if(!empty($request->get('date'))){
			$date= date('Y-m-d',strtotime($request->get('date')));
			$data1 =$data1->whereDate('listmatches.start_date',$date);
		}
            // $data2 = $data1->groupBy('registerusers.team');
		$d = $data1->get();   
            // echo "<pre>";print_r($d);die;
		$i=0;     
		if(!empty($d->toArray())){
         
			foreach($d as $post){
					// if($post->challengeid==68051){
					// 	dump($post);
					// }
                    if(($post->entryfee*$post->maximum_user)<=$post->win_amount){
                        // $i++;
                        continue;
                    }
                    $cusers = DB::connection('mysql2')
					->table('leaugestransactions')->where('challengeid',$post->challengeid)->count();
					
                    // total without bonus
                    // $total_WB =DB::table('leaugestransactions')->where('challengeid',$post->challengeid)->where('joinid','!=',0)->select(DB::raw('SUM(bonus)as bonus'),DB::raw('SUM(winning)as winning'),DB::raw('SUM(balance)as balance'))->first();
                    $total_WB =DB::connection('mysql2')
					->table('leaugestransactions')->where('challengeid',$post->challengeid)->where('joinid','!=',0)->limit($post->maximum_user)->get(['bonus','winning','balance']);
                    $bonus=array_sum(array_column($total_WB->toArray(), 'bonus'));
                    $winning=array_sum(array_column($total_WB->toArray(), 'winning'));
                    $balance=array_sum(array_column($total_WB->toArray(), 'balance'));
                    $total_amt = $bonus + $winning + $balance; 
                    // dd(array_sum(array_column($total_WB->toArray(), 'bonus')));
                    // dd($total_amt);



                    // $total = ($bonus_percentage!=0)?$post->entryfee:()
                    
                      $t_amut = $total_amt;
                      $rema_amt = (int)$t_amut-$post->win_amount;
                      $per_user = ($rema_amt/$post->maximum_user)-(($post->ba!=0)?$post->ba:0);
                      $per_u_tuber = $per_user*$cusers; 
                      // $per_u_tuber = $total_utuber_profit; 
                      $net_profit = DB::connection('mysql2')
					  ->table('registerusers')->where('id',$uid)->select('percentage')->first();
                      if(!empty($net_profit)){
                        $total_profit = ($per_user*$net_profit->percentage)/100; 
                      }else{
                        $total_profit = 0;
                      }
                    // if($post->challengeid==68051){
                        $json[$i]['date'] = $post->start_date;
                        $json[$i]['team'] = $post->team;
                        $json[$i]['name'] = $post->name;
                        $json[$i]['challengeid'] = $post->challengeid;
                        $json[$i]['entryfee'] = $post->entryfee;
                        $json[$i]['win_amount'] = $post->win_amount;
                        $json[$i]['maximum_user'] = $post->maximum_user;
                        $json[$i]['joinedusers'] = $post->joinedusers;
                        $json[$i]['net_profit'] = ($total_profit>0)?number_format($total_profit,2, ".", ""):0;
                    // }
                        $i++;
                    
                   
			}
			return response()->json($json);
		}else{
			return response()->json(array());
		}
	}	







