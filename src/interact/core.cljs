(ns interact.core
  (:require [reagent.core :as reagent :refer [atom]]
            [cljs.tools.reader :refer [read-string]]
            [cljs.env :refer [*compiler*]]
            [cljs.js :refer [empty-state eval js-eval]]))

(enable-console-print!)

(defn eval-str [s]
  (eval (empty-state)
        (read-string s)
        {:eval       js-eval
         :source-map true
         :context    :expr}
        (fn [result] result)))

(defn editor [input]
  (reagent/create-class
   {:render (fn [] [:textarea
                            {:default-value @input
                             :id "src"
                             :rows 20
                             :cols 75
                             :on-change #(reset! input (-> % .-target .-value))
                             :auto-complete "off"}])}))

(defn result-view [output]
  (reagent/create-class
   {:render (fn []
              [:pre>code.clj "stdout: " output])}))

(defn atom-input [value]
  [:input {:type "text"
           :value @value
           :on-change #(reset! value (-> % .-target .-value))}])

(defn call-function [function input output]
  (reset! output (function input)
  ))

(defn get-function [functions kword attr]
  (get-in @functions [kword attr]))

(defn block [name functions]
  (let [input-src (atom "(defn greet [name] (str \"hi\" name))")
        output-block (atom "block2")
        output (atom nil)
        inputs (atom "Dave, Clayton")]
    (fn []
      [:div.block
       [editor input-src]
       [:div
        [:button
         {:on-click #(swap! functions assoc name (eval-str @input-src))}
         "Compile"]
        [:button
         {:on-click #(call-function
                        (get-function functions (keyword @output-block) :value)
                        (call-function
                          (get-function functions name :value)
                          @inputs
                          (get-function functions name :output)
                          )))
                      ; reset! output
                      ; ((get-function functions (keyword @output-block))
                      ;  ((get-function functions name) @inputs)))
                          }
         "Run"]]
        [:span "Inputs: "][atom-input inputs]
        [:div " Output: " @output]
        [:span " Output block: "][atom-input functions :next]
       ;[:div
        ;[result-view (-> @functions name :value)]]
          ])))

(defn root []
  (let [functions (atom
                    {:block1 {:value nil :output nil :next nil}
                    :block2 {:value nil :output nil :next nil}})]
    (fn []
      [:div
       [block :block1 functions]
       [block :block2 functions]])))

(defn mount-root []
  (reagent/render [root] (.getElementById js/document "app")))

(mount-root)

(defn on-js-reload []
  ;; optionally touch your app-state to force rerendering depending on
  ;; your application
  ;; (swap! app-state update-in [:__figwheel_counter] inc)
)
