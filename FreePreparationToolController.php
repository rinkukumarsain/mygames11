<?php

namespace App\Http\Controllers\Website;

use Illuminate\Http\Request;
use DB;
use App\Helpers\Helpers;
use App\User;
use Hash;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Website\HeaderController;
use App\Http\Controllers\Website\FooterController;

use Mpdf;

class FreePreparationToolController extends Controller
{
    
    public function instructions($course_id,$slug) {
        
        if( session()->has('student') ) {

            $name = str_replace('-', ' ', $slug);

            $paper = DB::table('question_paper_subjects')
                        ->where('course_id', $course_id)
                        ->where('name', $name)
                        ->where('status','enable')
                        ->first();
            if( !empty($paper) ) {
                
                $paper->total_questions = $this->questions($paper->id)->count();
                
                $metatitle = $name."- Test Paper Instruction";

                return view('website.instructions', compact('metatitle','slug', 'paper'));
            } else {
                abort(404);
            }
        } else {
            return redirect()->action('Website\IndexController@index');
            
        }
    }

    public function test($course_id, $slug) {
    
        if( session()->has('student') ) {

            $name = str_replace('-', ' ', $slug);

            $paper = DB::table('question_paper_subjects')
                        ->where('course_id', $course_id)
                        ->where('status','enable')
                        ->where('name', $name)
                        ->first();

            if( !empty($paper) ) {
                
                $paper->total_questions = $this->questions($paper->id)->count();

                $question_answers = $this->questions($paper->id);
                
                $input = array();
                $input['user_id'] = session()->get('student')->id;
                $input['question_paper_subject_id'] = $paper->id;

                $test = DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->get()
                        ->groupBy(
                            function($query) {
                                return $query->question_answer_id;
                            }
                        );

                $timer = DB::table('test')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->first();

                if(
                   ! preg_match('/instructions/', url()->previous())
                ) {

                    if( !empty($timer) and $timer->status == 'submitted') {
                        return redirect()
                                ->action('Website\FreePreparationToolController@test_result', [$paper->course_id, $slug]);
                    } elseif( empty($timer) ) {
                        return redirect()
                                ->action('Website\FreePreparationToolController@instructions', [$paper->course_id,$slug]);
                    } else {

                        $metatitle = $name."- Test Paper";
                        
                       return view('website.test', compact('metatitle', 'paper', 'question_answers', 'test', 'timer'));
                    }
                    
                } else {

                    if( !empty($timer) and $timer->status == 'submitted') {
                        return redirect()
                                ->action('Website\FreePreparationToolController@test_result', [$paper->course_id, $slug]);
                    } else {

                        $metatitle = $name."- Test Paper";
                        
                        return view('website.test', compact('metatitle', 'paper', 'question_answers', 'test', 'timer'));
                    }
                }
                
            } else {
                abort(404);
            }

        } else {
            return redirect()->action('Website\IndexController@index');
        }
    }

    public function mark_as_review() {

        if( session()->has('student') ) {
        
            $input = array();
            $input['user_id'] = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
            $input['question_answer_id'] = request()->get('question_answer_id');
            $input['option'] = request()->get('option');

            if($input['option'] == 'undefined' or $input['option'] == '') {
                $input['option'] = '';
                $input['status'] = 'review';
            } else {                    
                $input['status'] = 'save_and_review';
            }

            $test = DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->first();

            if( !empty($test) ) {

                DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->update($input);
            } else {
                DB::table('test_status')
                    ->insert($input);
            }

            return 1;
            
        } else {
            return 0;
        }
    }
    
    public function questions($paper_id) {
        return DB::table('question_answer')
                ->where('question_paper_subject_id', $paper_id)
                ->where('status','enable')
                ->get();
    }

    public function question() {

        $current_question_id = request()->get('current_question_id');
        $next_question_id = request()->get('next_question_id');
    
        $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
        $input['question_answer_id'] = request()->get('question_answer_id');

        $question = DB::table('question_answer')
                    ->where('id', $current_question_id)
                    ->select(
                        'id', 'marks','negative_marks','question','a','b','c','d',
                        'a_type', 'b_type', 'c_type', 'd_type', 'image',
                        'is_mcq'
                    )
                    ->where('status','enable')
                    ->first();

        $test = '';
        if( session()->has('student') ) {
        
            $input = array();
            $input['user_id'] = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
            $input['question_answer_id'] = $current_question_id;

            $test = DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->select('option', 'status')
                        ->first();
        }

        return view()
                ->make('website.question', [
                    'question_answer' => $question,
                    'next_question_id' => $next_question_id,
                    'test' => $test
                ])
                ->render();
    }

    public function next_question() {  
        
        $paper_id = request()->get('paper_id');

        $questions = $this->questions($paper_id);

        $current_question_id = request()->get('current_question_id');

        if( !empty($questions) ) {
            for($j = 0; $j < count($questions); $j++) {
                if($questions[$j]->id == $current_question_id) {

                    if( !empty($questions[$j + 1]) ) {
                        return $questions[$j + 1]->id;
                    } else {
                        return '';
                    }
                }
            }
        }

    }

    public function previous_question() {

        if( session()->has('student') ) {
        
            $input = array();
            $input['user_id'] = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
            $input['question_answer_id'] = request()->get('question_answer_id');
            $input['option'] = request()->get('option');

            if($input['option'] == 'undefined' or $input['option'] == '') {
                $input['option'] = '';
                $input['status'] = 'save';
            } else {                    
                $input['status'] = 'save_and_next';
            }

            $test = DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->first();

            if( !empty($test) ) {

                DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->update($input);
            } else {
                DB::table('test_status')
                    ->insert($input);
            }
            
        } else {
        }
                
        $paper_id = request()->get('paper_id');

        $questions = $this->questions($paper_id);

        $current_question_id = request()->get('current_question_id');

        if( !empty($questions) ) {
            for($j = count($questions) - 1; $j >= 0; $j--) {
                if($questions[$j]->id == $current_question_id) {
                    
                    if( !empty($questions[$j - 1]) ) {
                        return $questions[$j - 1]->id;
                    } else {
                        return '';
                    }
                }
            }
        }

    }

    public function reset_answer() {

        if( session()->has('student') ) {
        
            $input = array();
            $input['user_id'] = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
            $input['question_answer_id'] = request()->get('question_answer_id');
            $input['option'] = '';
            $input['status'] = 'reset';

            $test = DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->first();

            if( !empty($test) ) {

                DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->update($input);
            } else {
                DB::table('test_status')
                    ->insert($input);
            }

            return 1;
            
        } else {
            return 0;
        }
    }

    public function save_and_next() {

        if( session()->has('student') ) {
        
            $input = array();
            $input['user_id'] = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
            $input['question_answer_id'] = request()->get('question_answer_id');
            $input['option'] = request()->get('option');

            if($input['option'] == 'undefined' or $input['option'] == '') {
                $input['option'] = '';
                $input['status'] = 'save';
            } else {                    
                $input['status'] = 'save_and_next';
            }

            $test = DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->first();

            if( !empty($test) ) {

                DB::table('test_status')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->where('question_answer_id', $input['question_answer_id'])
                        ->update($input);
            } else {
                DB::table('test_status')
                    ->insert($input);
            }

            return 1;
            
        } else {
            return 0;
        }
    }

    public function timer() {

        if( session()->has('student') ) {
        
            $input = array();
            $input['user_id'] = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');
            $input['hours'] = request()->get('hours');
            $input['minutes'] = request()->get('minutes');
            $input['seconds'] = request()->get('seconds');

            $test = DB::table('test')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->first();

            if( !empty($test) ) {

                DB::table('test')
                    ->where('user_id', $input['user_id'])
                    ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                    ->update($input);
            } else {
                DB::table('test')
                    ->insert($input);
            }

            $test = DB::table('test')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->first();

            return [
                "hours" => $test->hours,
                "minutes" => $test->minutes,
                "seconds" => $test->seconds
            ];
            
        } else {
            return 0;
        }
    }

    public function attempts() {
        if( session()->has('student') ) {

            $user_id = session()->get('student')->id;
            $input['question_paper_subject_id'] = request()->get('question_paper_subject_id');

            $question_answers = DB::table('question_answer')
                                    ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                                    ->select('id')
                                    ->where('status','enable')
                                    ->get();   
                           
            $result = array();
            $result['total_attempted'] = 0;
            $result['not_attempted'] = 0;

            if( !empty($question_answers) ) {
                
                foreach($question_answers as $question_answer) {
                    $test = DB::table('test_status')
                                ->where('user_id', $user_id)
                                ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                                ->where('question_answer_id', $question_answer->id)
                                ->first();

                    $question_answer->attempt = '';

                    if( !empty($test->option) ) {
                        $result['total_attempted'] += 1;
                        $question_answer->attempt = strtoupper($test->option);
                    } else {
                        $result['not_attempted'] += 1;
                    }
                }
            }
            
            $result['question_answers'] = $question_answers;

            return $result;
            
        }
    }

    public function test_submit($course_id, $slug) {
            
        if( session()->has('student') ) {

            $name = str_replace('-', ' ', $slug);

            $paper = DB::table('question_paper_subjects')
                        ->where('course_id', $course_id)
                        ->where('name', $name)
                        ->first();

            if( !empty($paper) ) {
                
                $input = array();
                $input['user_id'] = session()->get('student')->id;
                $input['question_paper_subject_id'] = $paper->id;
                $input['status'] = 'submitted';

                $test = DB::table('test')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->first();

                if( !empty($test) and $test->status == 'started') {
                    DB::table('test')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->update([
                            'status' => $input['status']
                        ]);
                        
                    try {
          
                        // send mail
                        $email = session()->get('student')->email;
                                
                        $student_name = session()->get('student')->name;
                                
                        $paper_name = DB::table('test')
                                    ->where('test.user_id', $input['user_id'])
                                    ->where('test.question_paper_subject_id', $input['question_paper_subject_id'])
                                    ->join('question_paper_subjects', 'question_paper_subjects.id', 'test.question_paper_subject_id')
                                    ->value('question_paper_subjects.name');
                        
                        $total_score = 0;
                        $correct = 0;
                        $incorrect = 0;
                        $attempted = 0;
                        $not_attempted = 0;
                        
                        $question_answers = DB::table('question_answer')
                                            ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                                            ->where('status','enable')
                                            ->get();   
                                    
                        $result = array();
        
                        $result['score'] = 0;
        
                        $result['correct'] = 0;
                        $result['incorrect'] = 0;
                        $result['attempted'] = 0;
                        $result['not_attempted'] = 0;
        
                        if( !empty($question_answers) ) {
                            
                            foreach($question_answers as $question_answer) {
                                
                                $test = DB::table('test_status')
                                            ->where('user_id', $input['user_id'])
                                            ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                                            ->where('question_answer_id', $question_answer->id)
                                            ->first();
        
                                $question_answer->attempt = '';
                                $question_answer->is_my_answer_correct = false;
        
                                if( !empty($test->option) ) {
                                    
                                    $result['attempted'] += 1;
        
                                    $question_answer->attempt = $test->option;
        
                                    if($question_answer->attempt == $question_answer->answer) {
                                        $result['score'] += $question_answer->marks;
        
                                        $question_answer->is_my_answer_correct = true;
        
                                        $result['correct'] += 1;
                                    } else {
        
                                        $question_answer->negative_marks = str_replace('-', '', $question_answer->negative_marks);
        
                                        $result['score'] -= $question_answer->negative_marks;
                                        
                                        $question_answer->is_my_answer_correct = false;
                                        
                                        $result['incorrect'] += 1;
                                    }
                                } else {
                                
                                    $result['not_attempted'] += 1;
        
                                }
                            }
                        }
                        
                        $total_score = $result['score'];
                        $correct = $result['correct'];
                        $incorrect = $result['incorrect'];
                        $attempted = $result['attempted'];
                        $not_attempted = $result['not_attempted'];
                        
                        $subject = 'CoachingSelect Free Test Analysis- '.$paper_name;
                
                        if( !empty($email) ) {
                                
                            $datamessage['email']=$email;
                    		$datamessage['subject']=$subject;
                    		
                    	    \Mail::send('mails.paper_submission', compact('student_name', 'paper_name', 'total_score',
                    	    'correct', 'incorrect', 'attempted', 'not_attempted'), function ($m) use ($datamessage){
                    			$m->from('support@coachingselect.com', 'CoachingSelect');
                    			$m->to($datamessage['email'])->subject($datamessage['subject']);
                    		});
                    		
                        }
                                        
                    } catch(\Exception $e) {
                        // ignore mail error
                    }
                    
                }

                return redirect()
                        ->action('Website\FreePreparationToolController@test_result', [$paper->course_id, $slug]);
                
            } else {
                abort(404);
            }

        } else {
            return redirect()->action('Website\IndexController@index');
        }
    }

    public function test_result($course_id, $slug) {
        
        $header = new HeaderController();
        $footer = new FooterController();
    
        if( session()->has('student') ) {

            $name = str_replace('-', ' ', $slug);

            $paper = DB::table('question_paper_subjects')
                        ->where('course_id', $course_id)
                        ->where('name', $name)
                        ->first();

            if( !empty($paper) ) {
                
                $input = array();
                $input['user_id'] = session()->get('student')->id;
                $input['question_paper_subject_id'] = $paper->id;

                $question_answers = DB::table('question_answer')
                                    ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                                    ->where('status','enable')
                                    ->get();   
                            
                $result = array();

                $result['score'] = 0;

                $result['correct'] = 0;
                $result['incorrect'] = 0;
                $result['attempted'] = 0;
                $result['not_attempted'] = 0;

                if( !empty($question_answers) ) {
                    
                    foreach($question_answers as $question_answer) {
                        $test = DB::table('test_status')
                                    ->where('user_id', $input['user_id'])
                                    ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                                    ->where('question_answer_id', $question_answer->id)
                                    ->first();

                        $question_answer->attempt = '';
                        $question_answer->is_my_answer_correct = false;

                        if( !empty($test->option) ) {
                            
                            $result['attempted'] += 1;

                            $question_answer->attempt = $test->option;

                            if($question_answer->attempt == $question_answer->answer) {
                                $result['score'] += $question_answer->marks;

                                $question_answer->is_my_answer_correct = true;

                                $result['correct'] += 1;
                            } else {

                                $question_answer->negative_marks = str_replace('-', '', $question_answer->negative_marks);

                                $result['score'] -= $question_answer->negative_marks;
                                
                                $question_answer->is_my_answer_correct = false;
                                
                                $result['incorrect'] += 1;
                            }
                        } else {
                        
                            $result['not_attempted'] += 1;

                        }
                    }
                }
                
                $result['question_answers'] = $question_answers;

                $timer = DB::table('test')
                        ->where('user_id', $input['user_id'])
                        ->where('question_paper_subject_id', $input['question_paper_subject_id'])
                        ->first();

                if( !empty($timer) and $timer->status == 'started') {
                    return redirect()
                            ->action('Website\FreePreparationToolController@test', [$paper->course_id, $slug]);
                }

                $metatitle = $name."- Test Paper Result, Solution & Analysis";
                        
                return view('website.test_result', compact('metatitle', 'header', 'footer',
                                                            'paper', 'result'));

            } else {
                abort(404);
            }

        } else {
            return redirect()->action('Website\IndexController@index');
        }
    }

    public function question_papers_stream_wise() {
        
        $header = new HeaderController();
        $footer = new FooterController();

        $question_paper_subjects = DB::table('question_paper_subjects')
                                    ->join('streams', 'streams.id', 'question_paper_subjects.stream_id')
                                    ->join('courses', 'courses.id', 'question_paper_subjects.course_id')
                                    ->where('question_paper_subjects.status', 'enable')
                                    ->where('courses.status', 'enable')
                                    ->where('streams.status', 'enable')
                                    ->select(
                                        'streams.name as stream_name',
                                        'streams.image as stream_image',
                                        'courses.name as question_paper_subjects_name',
                                        'question_paper_subjects.course_id as course_id'
                                    )
                                    ->distinct('courses.name')
                                    
                                    ->get()
                                    ->groupBy(
                                        function($query) {
                                            return $query->stream_name;
                                        }
                                    );

        $metatitle = 'Free Study Material- Exam Papers, Mocks, Sample Questions, NCERT Solutions and Notes';

        $metadescription= "Free Study Material- Exam Papers, Mocks, Sample Questions,CBSE, ICSE, NCERT Solutions and Notes, UPSC, IAS, SSC, Bank, clerk, CLAT, IPM, JEE and NEET Practice Tests. Candidates are advised to solve as many sample paper as you can. Check section wise (Critical Reading, Maths, and Writing) exam paper here.";

        $metakeywords="coachingselect,Mocks, Tests, Pdfs, Free Study Material, education, colleges,universities, institutes,career, career options, career prospects,engineering, mba, medical, mbbs,study abroad, foreign education, college, university, JEE,NEET, UPSC ,IAS , SSC, Bank jobs, institute,courses, coaching, technical education, higher education,forum, community, education career experts,ask experts, admissions,results, events,scholarships";

        return view('website.question_papers_stream_wise', compact('metatitle','header', 'footer', 'question_paper_subjects','metadescription','metakeywords'
        ));
    }

    public function question_papers($stream = '') {
        
        # stream, course, year wise
        $header = new HeaderController();
        $footer = new FooterController();

        $course_name = '';
       
        $question_paper_subjects = DB::table('courses')                                    
                                    ->join(
                                        'question_paper_subjects',
                                        'question_paper_subjects.course_id',
                                        'courses.id'
                                    );
                                    
        
        if( !empty($course_slug) ) {
            
            $course_name = str_replace('-', ' ', $course_slug);

            $question_paper_subjects = $question_paper_subjects
                                            ->where('courses.name', $course_name);

        }

        if( !empty( request()->get('course_id') ) ) {
            
            $course_id = request()->get('course_id');

            $question_paper_subjects = $question_paper_subjects
                                            ->where('courses.id', $course_id);

        }
        
        if( 
            !empty(
                request()->get('year')
            )
        ) {
           $question_paper_subjects = $question_paper_subjects
                                        ->where('question_paper_subjects.year', request()->get('year')); 
        }

        $stream_id = '';

        if( 
            !empty($stream)
        ) {

            $stream = str_replace('-', ' ', $stream);

            $stream_id = DB::table('streams')
                        ->where('name', $stream)
                        ->value('id');

            $question_paper_subjects = $question_paper_subjects
                                        ->where('question_paper_subjects.stream_id', $stream_id); 
        }

        if( 
            !empty( request()->get('course_id') )
        ) {

            $course_id = request()->get('course_id');

            $question_paper_subjects = $question_paper_subjects
                                        ->where('question_paper_subjects.course_id', $course_id); 
        }
        
        $question_paper_subjects = $question_paper_subjects
                                ->select(
                                    'question_paper_subjects.*'    
                                )
                                ->join('streams', 'streams.id', 'courses.stream_id')
                                ->where('question_paper_subjects.status', 'enable')
                                ->where('courses.status', 'enable')
                                ->where('streams.status', 'enable')
                                ->get();

        if( empty($question_paper_subjects->toArray()) ) {
            abort(404);
        } 

        if( !empty($question_paper_subjects) ) {
            foreach($question_paper_subjects as $question_paper_subject) {
                
                $question_paper_subject->total_questions =  DB::table('question_answer')
                                                            ->where('question_paper_subject_id', $question_paper_subject->id)
                                                            ->where('status','enable')
                                                            ->count();
                                                
                $question_paper_subject->is_test_attempted_by_me = false;
                $question_paper_subject->is_test_attempted_by_me_submitted = false;

                if( session()->has('student') ) {

                    $timer = DB::table('test')
                            ->where('user_id', session()->get('student')->id)
                            ->where('question_paper_subject_id', $question_paper_subject->id)
                            ->first();

                    if( !empty($timer) and $timer->status == 'submitted') {
                                
                        $question_paper_subject->is_test_attempted_by_me = true;
                        $question_paper_subject->is_test_attempted_by_me_submitted = true;
                    } elseif( !empty($timer) and $timer->status != 'submitted') {
                                
                        $question_paper_subject->is_test_attempted_by_me = true;
                        $question_paper_subject->is_test_attempted_by_me_submitted = false;
                    } 
                }
            }
        }

        $years = DB::table('courses')                                    
                ->join(
                    'question_paper_subjects',
                    'question_paper_subjects.course_id',
                    'courses.id'
                );

        if( 
            !empty($stream)
        ) {

            $stream = str_replace('-', ' ', $stream);

            $stream_id = DB::table('streams')
                        ->where('name', $stream)
                        ->value('id');

            $years = $years
                    ->where('question_paper_subjects.stream_id', $stream_id); 
        }

        if( !empty( request()->get('course_id') ) ) {
            
            $course_id = request()->get('course_id');

            $years = $years
                    ->where('courses.id', $course_id);
        }
        
        $years = $years
                    ->pluck('year')
                    ->unique();
                    
        $hours = $question_paper_subjects
                    ->sum('hours');

        $total_questions = $question_paper_subjects->sum('total_questions');

        $streams = DB::table('streams')
                ->select('id', 'name')
                ->where('status', 'enable')
                ->get();

        $courses = '';

        if(
            ! empty($stream_id)
        ) {
                
            $courses = DB::table('courses')
                        ->join('question_paper_subjects', 'question_paper_subjects.course_id', 'courses.id')
                        ->where('courses.stream_id', $stream_id)
                        ->select('courses.*')
                        ->distinct('courses.name')
                        ->where('courses.status', 'enable')
                        ->get();
        }

        $year = request()->get('year');

        $metatitle = $stream." ".$year."- Exam Papers, Mocks, Sample Questions, NCERT Solutions and Notes";

        $course_id = request()->get('course_id');

        $course_name = DB::table('courses')
                        ->where('id', $course_id)
                        ->value('name');
          
        if( !empty($course_name) ) {
            $metatitle = $course_name."- Exam Papers, Mocks, Sample Questions, NCERT Solutions and Notes";
        }

        $metadescription= "Coachingselect - Free online $stream courses. Get free $stream e-books and $stream courses online in India. Attempt mocks and actual paper in real testing mode,all $stream courses available online";

        $metakeywords="coachingselect, $stream courses, $stream e-books, free online $stream courses, free $stream e-books, $stream study material, $stream course, free $stream books, online $stream courses in india, free $stream courses, list of $stream e-books, online $stream courses,Mocks , $stream previous year papers, $stream paper pdfs , free $stream  papers download, attempt $stream  papers, $stream  test series, Free Mock paper of $stream   preparation";

        return view('website.question_papers', compact('metatitle','header', 'footer', 'course_name', 'question_paper_subjects', 'years', 'hours', 'total_questions', 'streams', 'courses', 'stream_id','stream','metadescription','metakeywords'));
    }
}

